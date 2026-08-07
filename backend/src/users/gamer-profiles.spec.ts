import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { GamerProfilesService } from "./gamer-profiles.service";
import { GamerProfilesController } from "./gamer-profiles.controller";
import { GamerProfile } from "./schemas/gamer-profile.schema";
import { User } from "./schemas/user.schema";

describe("GamerProfiles Privacy Enforcer", () => {
  let service: GamerProfilesService;
  let controller: GamerProfilesController;

  const mockProfile = {
    userId: "user-1",
    gamerTag: "GamerOne#1337",
    availability: [{ dayOfWeek: 1, startTime: "18:00", endTime: "22:00" }],
    privacy: {
      isPublic: true,
      showOnlineStatus: true,
      showMatchHistory: true,
    },
    toObject() {
      return {
        userId: this.userId,
        gamerTag: this.gamerTag,
        availability: [...this.availability],
        privacy: { ...this.privacy },
      };
    },
  };

  const mockProfileModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockUserModel = {
    updateOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamerProfilesController],
      providers: [
        GamerProfilesService,
        {
          provide: getModelToken(GamerProfile.name),
          useValue: mockProfileModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<GamerProfilesService>(GamerProfilesService);
    controller = module.get<GamerProfilesController>(GamerProfilesController);

    jest.clearAllMocks();
  });

  describe("Service - getProfileByUserId", () => {
    it("should return the full profile when the requester is the owner", async () => {
      mockProfileModel.findOne.mockResolvedValue(mockProfile);

      const result = await service.getProfileByUserId("user-1", "user-1");
      expect(result).toBe(mockProfile);
      expect(result.availability).toHaveLength(1);
    });

    it("should return the full profile when no requester is provided", async () => {
      mockProfileModel.findOne.mockResolvedValue(mockProfile);

      const result = await service.getProfileByUserId("user-1");
      expect(result).toBe(mockProfile);
    });

    it("should return the profile but redact availability if showOnlineStatus is false for a non-owner", async () => {
      const restrictedProfile = {
        ...mockProfile,
        privacy: {
          isPublic: true,
          showOnlineStatus: false,
          showMatchHistory: true,
        },
        toObject() {
          return {
            userId: this.userId,
            gamerTag: this.gamerTag,
            availability: [...this.availability],
            privacy: { ...this.privacy },
          };
        },
      };
      mockProfileModel.findOne.mockResolvedValue(restrictedProfile);

      const result = await service.getProfileByUserId("user-1", "user-2");
      expect(result.userId).toBe("user-1");
      expect(result.availability).toHaveLength(0); // Redacted!
      expect(result.privacy.showOnlineStatus).toBe(false);
    });

    it("should throw ForbiddenException if isPublic is false and requester is not the owner", async () => {
      const privateProfile = {
        ...mockProfile,
        privacy: {
          isPublic: false,
          showOnlineStatus: true,
          showMatchHistory: true,
        },
      };
      mockProfileModel.findOne.mockResolvedValue(privateProfile);

      await expect(service.getProfileByUserId("user-1", "user-2")).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe("Controller - getProfile", () => {
    it("should pass requester user ID from JWT context to the service", async () => {
      const getProfileSpy = jest.spyOn(service, "getProfileByUserId").mockResolvedValue(mockProfile);

      const user = { sub: "requester-id", username: "req" };
      await controller.getProfile("target-id", user as any);

      expect(getProfileSpy).toHaveBeenCalledWith("target-id", "requester-id");
    });
  });
});
