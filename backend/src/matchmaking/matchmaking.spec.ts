import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { WsException } from "@nestjs/websockets";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Types } from "mongoose";
import { MatchmakingService } from "./matchmaking.service";
import { MatchmakingController } from "./matchmaking.controller";
import { MatchRequest } from "./schemas/match-request.schema";
import { MatchSession } from "./schemas/match-session.schema";
import { MatchingService } from "./matching.service";
import { RealtimeService } from "../realtime/realtime.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { PresenceService } from "../realtime/presence.service";
import { ChatService } from "../chat/chat.service";
import { JwtService } from "@nestjs/jwt";

describe("Matchmaking & Realtime Gaps", () => {
  let service: MatchmakingService;
  let controller: MatchmakingController;
  let gateway: RealtimeGateway;

  const mockRequestModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    updateMany: jest.fn(),
    updateOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockSessionModel = {
    findById: jest.fn(),
    find: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
  };

  const mockMatchingService = {
    findCompatibleRequest: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key, defaultValue) => {
      if (key === "MATCH_REQUEST_TTL_SECONDS") return 300;
      if (key === "MATCH_MAX_PING_MS") return 100;
      if (key === "MATCH_ACCEPT_TIMEOUT_SECONDS") return 30;
      return defaultValue;
    }),
  };

  const mockRealtimeService = {
    emitToUsers: jest.fn(),
    setServer: jest.fn(),
  };
  const mockPresenceService = {};
  const mockChatService = {};
  const mockJwtService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchmakingController],
      providers: [
        MatchmakingService,
        RealtimeGateway,
        {
          provide: getModelToken(MatchRequest.name),
          useValue: mockRequestModel,
        },
        {
          provide: getModelToken(MatchSession.name),
          useValue: mockSessionModel,
        },
        {
          provide: MatchingService,
          useValue: mockMatchingService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RealtimeService,
          useValue: mockRealtimeService,
        },
        {
          provide: PresenceService,
          useValue: mockPresenceService,
        },
        {
          provide: ChatService,
          useValue: mockChatService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<MatchmakingService>(MatchmakingService);
    controller = module.get<MatchmakingController>(MatchmakingController);
    gateway = module.get<RealtimeGateway>(RealtimeGateway);

    jest.clearAllMocks();
  });

  describe("Service - createRequest", () => {
    it("should throw BadRequestException if pingMs exceeds maxPingMs", async () => {
      await expect(
        service.createRequest({
          userId: "user-1",
          gameId: "lol",
          skill: 5,
          region: "na",
          pingMs: 150,
          maxPingMs: 100,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it("should queue the request if no compatible candidate is found", async () => {
      const mockReq = {
        id: "req-123",
        _id: new Types.ObjectId(),
        userId: "user-1",
        gameId: "lol",
        skill: 5,
      };
      mockRequestModel.create.mockResolvedValue(mockReq);
      mockMatchingService.findCompatibleRequest.mockResolvedValue(null);
      mockRequestModel.countDocuments.mockResolvedValue(5);

      const result = await service.createRequest({
        userId: "user-1",
        gameId: "lol",
        skill: 5,
        region: "na",
      });

      expect(result.status).toBe("queued");
      expect(result.requestId).toBe("req-123");
      expect(result.estimatedWaitSeconds).toBe(60); // 5 * 12 = 60
    });

    it("should match candidate and create session if compatible candidate is successfully reserved", async () => {
      const p1 = new Types.ObjectId();
      const p2 = new Types.ObjectId();
      const mockReq = {
        _id: new Types.ObjectId(),
        id: "req-1",
        userId: p1,
        gameId: "lol",
        skill: 5,
        region: "na",
      };
      const mockCand = {
        _id: new Types.ObjectId(),
        id: "req-2",
        userId: p2,
        gameId: "lol",
        skill: 5,
        region: "na",
      };

      mockRequestModel.create.mockResolvedValue(mockReq);
      mockMatchingService.findCompatibleRequest.mockResolvedValue(mockCand);
      mockRequestModel.findOneAndUpdate.mockResolvedValue(mockCand); // successful reserve
      mockRequestModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockRequestModel.countDocuments.mockResolvedValue(5);

      const mockSession = {
        _id: new Types.ObjectId(),
        gameId: "lol",
        playerIds: [p1, p2],
        status: "pending",
        acceptedBy: [],
        expiresAt: new Date(),
      };
      mockSessionModel.create.mockResolvedValue(mockSession);

      const result = await service.createRequest({
        userId: p1.toString(),
        gameId: "lol",
        skill: 5,
        region: "na",
      });

      expect(result.status).toBe("matched");
      expect(result.matchSessionId).toBe(mockSession._id.toString());
      expect(mockSessionModel.create).toHaveBeenCalled();
      expect(mockRealtimeService.emitToUsers).toHaveBeenCalled();
    });
  });

  describe("Service - cancelRequest", () => {
    it("should cancel request successfully if owned by the user", async () => {
      const mockRequest = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId("60b9f7831f2c2534f40f06a1"),
        status: "queued",
        save: jest.fn().mockResolvedValue(true),
      };
      mockRequestModel.findById.mockResolvedValue(mockRequest);

      const result = await service.cancelRequest(
        mockRequest._id.toString(),
        "60b9f7831f2c2534f40f06a1"
      );

      expect(result).toEqual({ success: true, message: "Matchmaking request cancelled." });
      expect(mockRequest.status).toBe("cancelled");
      expect(mockRequest.save).toHaveBeenCalled();
    });

    it("should throw ForbiddenException if request does not belong to user", async () => {
      const mockRequest = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId("60b9f7831f2c2534f40f06a1"),
        status: "queued",
      };
      mockRequestModel.findById.mockResolvedValue(mockRequest);

      await expect(
        service.cancelRequest(mockRequest._id.toString(), "60b9f7831f2c2534f40f06a2")
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException if request not found", async () => {
      mockRequestModel.findById.mockResolvedValue(null);

      await expect(
        service.cancelRequest(new Types.ObjectId().toString(), "60b9f7831f2c2534f40f06a1")
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if request is not queued", async () => {
      const mockRequest = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId("60b9f7831f2c2534f40f06a1"),
        status: "matched",
      };
      mockRequestModel.findById.mockResolvedValue(mockRequest);

      await expect(
        service.cancelRequest(mockRequest._id.toString(), "60b9f7831f2c2534f40f06a1")
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("Service - getCurrentRequest", () => {
    it("should return the latest active request", async () => {
      const mockRequest = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId("60b9f7831f2c2534f40f06a1"),
        status: "queued",
      };
      mockRequestModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockRequest),
      });

      const result = await service.getCurrentRequest("60b9f7831f2c2534f40f06a1");
      expect(result).toBe(mockRequest);
    });

    it("should throw NotFoundException if no active request exists", async () => {
      mockRequestModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.getCurrentRequest("60b9f7831f2c2534f40f06a1")
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("Service - completeMatch", () => {
    it("should complete match session successfully if user is a participant", async () => {
      const p1 = new Types.ObjectId("60b9f7831f2c2534f40f06a1");
      const p2 = new Types.ObjectId("60b9f7831f2c2534f40f06a2");
      const mockSession = {
        _id: new Types.ObjectId(),
        playerIds: [p1, p2],
        requestIds: [new Types.ObjectId(), new Types.ObjectId()],
        status: "active",
        save: jest.fn().mockResolvedValue(true),
      };
      mockSessionModel.findById.mockResolvedValue(mockSession);

      const result = await service.completeMatch(
        mockSession._id.toString(),
        p1.toString()
      );

      expect(result.status).toBe("completed");
      expect(mockSession.save).toHaveBeenCalled();
      expect(mockRequestModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: mockSession.requestIds } },
        { $set: { status: "expired" } }
      );
      expect(mockRealtimeService.emitToUsers).toHaveBeenCalledWith(
        [p1.toString(), p2.toString()],
        "match.completed",
        {
          sessionId: mockSession._id.toString(),
          status: "completed"
        }
      );
    });

    it("should throw UnauthorizedException if user is not a participant", async () => {
      const p1 = new Types.ObjectId("60b9f7831f2c2534f40f06a1");
      const p2 = new Types.ObjectId("60b9f7831f2c2534f40f06a2");
      const mockSession = {
        _id: new Types.ObjectId(),
        playerIds: [p1, p2],
      };
      mockSessionModel.findById.mockResolvedValue(mockSession);

      await expect(
        service.completeMatch(mockSession._id.toString(), "60b9f7831f2c2534f40f06a3")
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw NotFoundException if session is not found", async () => {
      mockSessionModel.findById.mockResolvedValue(null);

      await expect(
        service.completeMatch(new Types.ObjectId().toString(), "60b9f7831f2c2534f40f06a1")
      ).rejects.toThrow(NotFoundException);
    });
  });


  describe("Service - expireMatchSessions", () => {
    it("should mark expired sessions and requests, and notify players", async () => {
      const p1 = new Types.ObjectId();
      const p2 = new Types.ObjectId();
      const mockSession = {
        _id: new Types.ObjectId(),
        gameId: "lol",
        playerIds: [p1, p2],
        requestIds: [new Types.ObjectId(), new Types.ObjectId()],
        status: "pending",
        expiresAt: new Date(Date.now() - 1000),
        save: jest.fn().mockResolvedValue(true),
      };

      mockSessionModel.find.mockResolvedValue([mockSession]);

      await service.expireMatchSessions();

      expect(mockSession.status).toBe("expired");
      expect(mockSession.save).toHaveBeenCalled();
      expect(mockRequestModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: mockSession.requestIds } },
        { $set: { status: "expired" }, $unset: { matchSessionId: "" } }
      );
      expect(mockRealtimeService.emitToUsers).toHaveBeenCalledWith(
        [p1.toString(), p2.toString()],
        "match.expired",
        { sessionId: mockSession._id.toString() }
      );
    });
  });

  describe("RealtimeGateway - match.accepted & match.declined", () => {
    it("should call acceptMatch on matchmakingService when match.accepted WS event is received", async () => {
      const acceptMatchSpy = jest
        .spyOn(service, "acceptMatch")
        .mockResolvedValue({} as any);

      const client = {
        data: {
          user: { sub: "user-1", username: "GamerOne" },
        },
      };

      await gateway.handleMatchAccepted(client as any, { sessionId: "session-1" });

      expect(acceptMatchSpy).toHaveBeenCalledWith("session-1", "user-1");
    });

    it("should throw WsException when acceptMatch fails", async () => {
      jest.spyOn(service, "acceptMatch").mockRejectedValue(new Error("Accept failed"));

      const client = {
        data: {
          user: { sub: "user-1", username: "GamerOne" },
        },
      };

      await expect(
        gateway.handleMatchAccepted(client as any, { sessionId: "session-1" })
      ).rejects.toThrow(WsException);
    });

    it("should call declineMatch on matchmakingService when match.declined WS event is received", async () => {
      const declineMatchSpy = jest
        .spyOn(service, "declineMatch")
        .mockResolvedValue({} as any);

      const client = {
        data: {
          user: { sub: "user-1", username: "GamerOne" },
        },
      };

      await gateway.handleMatchDeclined(client as any, { sessionId: "session-1" });

      expect(declineMatchSpy).toHaveBeenCalledWith("session-1", "user-1");
    });

    it("should throw WsException when declineMatch fails", async () => {
      jest.spyOn(service, "declineMatch").mockRejectedValue(new Error("Decline failed"));

      const client = {
        data: {
          user: { sub: "user-1", username: "GamerOne" },
        },
      };

      await expect(
        gateway.handleMatchDeclined(client as any, { sessionId: "session-1" })
      ).rejects.toThrow(WsException);
    });
  });

  describe("Service & Controller - getMyMatchSessions (GAP A)", () => {
    it("should return sessions for authenticated user from controller", async () => {
      const mockSessions = [
        { _id: new Types.ObjectId(), gameId: "valorant", status: "completed" }
      ];
      jest.spyOn(service, "getMyMatchSessions").mockResolvedValue(mockSessions as any);

      const result = await controller.getMyMatchSessions(
        { sub: "user-123", email: "test@example.com", roles: [] },
        "completed"
      );

      expect(service.getMyMatchSessions).toHaveBeenCalledWith("user-123", "completed");
      expect(result).toBe(mockSessions);
    });

    it("should query sessionModel with user playerIds and optional status filter in service", async () => {
      const userId = new Types.ObjectId("60b9f7831f2c2534f40f06a1");
      const mockSessions = [
        { _id: new Types.ObjectId(), gameId: "valorant", status: "completed" }
      ];

      mockSessionModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockSessions)
        })
      });

      const resCompleted = await service.getMyMatchSessions(userId.toString(), "completed");
      expect(mockSessionModel.find).toHaveBeenCalledWith({
        $or: [
          { playerIds: userId },
          { playerIds: userId.toString() }
        ],
        status: "completed"
      });
      expect(resCompleted).toBe(mockSessions);
    });
  });
});

