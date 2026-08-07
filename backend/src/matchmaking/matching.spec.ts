import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { Types } from "mongoose";
import { MatchingService } from "./matching.service";
import { MatchRequest } from "./schemas/match-request.schema";

describe("MatchingService Core Logic", () => {
  let service: MatchingService;

  const mockRequestModel = {
    find: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key, defaultValue) => {
      if (key === "MATCH_MAX_SKILL_GAP") return 2;
      if (key === "MATCH_MAX_PING_MS") return 100;
      return defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        {
          provide: getModelToken(MatchRequest.name),
          useValue: mockRequestModel,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
    jest.clearAllMocks();
  });

  describe("findCompatibleRequest", () => {
    it("should return null if no candidates are found in DB", async () => {
      const mockRequest = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(),
        gameId: "lol",
        skill: 5,
        region: "na",
        pingMs: 50,
      } as any;

      mockRequestModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.findCompatibleRequest(mockRequest);
      expect(result).toBeNull();
    });

    it("should match a candidate if skill, region, and ping are fully compatible", async () => {
      const mockRequest = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(),
        gameId: "lol",
        skill: 5,
        region: "na",
        pingMs: 40,
        maxPingMs: 80,
      } as any;

      const mockCandidate = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(),
        gameId: "lol",
        skill: 6, // gap is 1 (<= 2)
        region: "na",
        pingMs: 50, // <= min(80, 100)
        maxPingMs: 120,
      } as any;

      mockRequestModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockCandidate]),
        }),
      });

      const result = await service.findCompatibleRequest(mockRequest);
      expect(result).toBe(mockCandidate);
    });

    it("should return null if skill gap is exceeded", async () => {
      const mockRequest = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(),
        gameId: "lol",
        skill: 5,
        region: "na",
        pingMs: 40,
      } as any;

      const mockCandidate = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(),
        gameId: "lol",
        skill: 8, // gap is 3 (> 2)
        region: "na",
        pingMs: 40,
      } as any;

      mockRequestModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockCandidate]),
        }),
      });

      const result = await service.findCompatibleRequest(mockRequest);
      expect(result).toBeNull();
    });

    it("should return null if candidate ping exceeds max allowed ping", async () => {
      const mockRequest = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(),
        gameId: "lol",
        skill: 5,
        region: "na",
        pingMs: 40,
        maxPingMs: 60, // limits allowed ping
      } as any;

      const mockCandidate = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(),
        gameId: "lol",
        skill: 5,
        region: "na",
        pingMs: 70, // > 60
      } as any;

      mockRequestModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockCandidate]),
        }),
      });

      const result = await service.findCompatibleRequest(mockRequest);
      expect(result).toBeNull();
    });
  });
});
