import { Test, TestingModule } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import { of, throwError } from "rxjs";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";

describe("AI Module Tests", () => {
  let service: AiService;
  let controller: AiController;

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key, defaultValue) => {
      if (key === "AI_SERVICE_URL") return "http://localhost:8000";
      if (key === "AI_CACHE_TTL_SECONDS") return 300;
      if (key === "AI_TIMEOUT_MS") return 4000;
      return defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        AiService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    controller = module.get<AiController>(AiController);

    jest.clearAllMocks();
  });

  describe("Service - recommend", () => {
    it("should return cached recommendations if present", async () => {
      const mockResult = { games: [], teammates: [], extracted_interests: [] };
      mockCacheManager.get.mockResolvedValue(mockResult);

      const result = await service.recommend("user-1", {
        userHistory: [],
        preferences: {},
      });

      expect(result).toBe(mockResult);
      expect(mockHttpService.post).not.toHaveBeenCalled();
    });

    it("should call AI service and set cache on success", async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const mockResult = { games: [{ id: "lol", score: 0.9, reason: "love" }], teammates: [], extracted_interests: [] };
      mockHttpService.post.mockReturnValue(of({ data: mockResult }));

      const result = await service.recommend("user-1", {
        userHistory: [],
        preferences: {},
      });

      expect(result).toEqual(mockResult);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it("should use fallback recommendations when AI service fails", async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockHttpService.post.mockReturnValue(throwError(() => new Error("AI service down")));

      const result = await service.recommend("user-1", {
        userHistory: [],
        preferences: { genres: ["fps"] },
        gamesCatalog: [{ gameId: "game-1", title: "Game One", tags: ["fps"], genres: ["fps"] }],
      });

      expect(result.games).toBeDefined();
      expect(result.games.length).toBeGreaterThan(0);
      expect(result.games[0].id).toBe("game-1");
      expect(mockCacheManager.set).toHaveBeenCalled();
    });
  });
});
