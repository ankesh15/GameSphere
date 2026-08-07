import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Types } from "mongoose";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { ChatMessage } from "./schemas/chat-message.schema";
import { MatchSession } from "../matchmaking/schemas/match-session.schema";
import { Clan } from "../clan/schemas/clan.schema";

describe("Chat Module Tests", () => {
  let service: ChatService;
  let controller: ChatController;

  const mockChatModel = {
    create: jest.fn(),
    find: jest.fn(),
  };

  const mockMatchSessionModel = {
    findById: jest.fn(),
  };

  const mockClanModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        ChatService,
        {
          provide: getModelToken(ChatMessage.name),
          useValue: mockChatModel,
        },
        {
          provide: getModelToken(MatchSession.name),
          useValue: mockMatchSessionModel,
        },
        {
          provide: getModelToken(Clan.name),
          useValue: mockClanModel,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    controller = module.get<ChatController>(ChatController);

    jest.clearAllMocks();
  });

  describe("Service - canJoinRoom", () => {
    it("should allow a user to join a match room if they are in playerIds", async () => {
      const matchId = new Types.ObjectId().toString();
      mockMatchSessionModel.findById.mockResolvedValue({
        playerIds: [new Types.ObjectId("60b9f7831f2c2534f40f06a1")],
      });

      const canJoin = await service.canJoinRoom("60b9f7831f2c2534f40f06a1", `match:${matchId}`);
      expect(canJoin).toBe(true);
    });

    it("should reject a user from a match room if they are not in playerIds", async () => {
      const matchId = new Types.ObjectId().toString();
      mockMatchSessionModel.findById.mockResolvedValue({
        playerIds: [new Types.ObjectId("60b9f7831f2c2534f40f06a2")],
      });

      const canJoin = await service.canJoinRoom("60b9f7831f2c2534f40f06a1", `match:${matchId}`);
      expect(canJoin).toBe(false);
    });

    it("should reject a user from a clan room if the clan does not exist", async () => {
      const clanId = new Types.ObjectId().toString();
      mockClanModel.findById.mockResolvedValue(null);

      const canJoin = await service.canJoinRoom("60b9f7831f2c2534f40f06a1", `clan:${clanId}`);
      expect(canJoin).toBe(false);
    });

    it("should allow a user to join a clan room with a channel suffix if they are a member", async () => {
      const clanId = new Types.ObjectId().toString();
      mockClanModel.findById.mockResolvedValue({
        ownerId: new Types.ObjectId("60b9f7831f2c2534f40f06a1"),
        memberIds: [new Types.ObjectId("60b9f7831f2c2534f40f06a1")],
      });

      const canJoin = await service.canJoinRoom("60b9f7831f2c2534f40f06a1", `clan:${clanId}-general`);
      expect(canJoin).toBe(true);
      expect(mockClanModel.findById).toHaveBeenCalledWith(clanId);
    });
  });

  describe("Service - createMessage", () => {
    it("should successfully send message", async () => {
      const clanId = new Types.ObjectId();
      const mockMsg = {
        _id: new Types.ObjectId(),
        chatRoomId: `clan:${clanId}`,
        senderId: new Types.ObjectId(),
        content: "hello world",
        messageType: "text",
        createdAt: new Date(),
      };
      mockChatModel.create.mockResolvedValue(mockMsg);

      const result = await service.createMessage("60b9f7831f2c2534f40f06a1", {
        roomId: `clan:${clanId}`,
        content: "hello world",
      });

      expect(result.content).toBe("hello world");
    });

    it("should throw NotFoundException if room id is invalid format", async () => {
      await expect(
        service.createMessage("user-1", { roomId: "invalid-room", content: "hello" })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("Controller - endpoints", () => {
    it("should throw UnauthorizedException if user cannot join room for messages", async () => {
      jest.spyOn(service, "canJoinRoom").mockResolvedValue(false);

      await expect(
        controller.getMessages(
          { sub: "user-1", email: "tester@example.com", roles: [] },
          "clan:123",
          {}
        )
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
