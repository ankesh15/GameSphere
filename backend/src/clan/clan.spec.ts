import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Types } from "mongoose";
import { ClanService } from "./clan.service";
import { ClanController } from "./clan.controller";
import { Clan } from "./schemas/clan.schema";
import { NotificationsService } from "../notifications/notifications.service";

describe("Clan Module Tests", () => {
  let service: ClanService;
  let controller: ClanController;

  const mockClanModel = {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  const user1 = "60b9f7831f2c2534f40f06a1";
  const user2 = "60b9f7831f2c2534f40f06a2";

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClanController],
      providers: [
        ClanService,
        {
          provide: getModelToken(Clan.name),
          useValue: mockClanModel,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<ClanService>(ClanService);
    controller = module.get<ClanController>(ClanController);

    jest.clearAllMocks();
  });

  describe("Service - createClan", () => {
    it("should successfully create a clan", async () => {
      const mockCreated = {
        _id: new Types.ObjectId(),
        name: "Liquid",
        tag: "TL",
      };
      mockClanModel.create.mockResolvedValue(mockCreated);

      const result = await service.createClan(user1, {
        name: "Liquid",
        tag: "TL",
        description: "Liquid Clan",
        isPublic: true,
      });

      expect(result).toBe(mockCreated);
    });

    it("should throw ConflictException on duplicate clan name/tag", async () => {
      mockClanModel.create.mockRejectedValue({ code: 11000 });

      await expect(
        service.createClan(user1, {
          name: "Liquid",
          tag: "TL",
          isPublic: true,
        })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("Service - inviteMember", () => {
    it("should throw ConflictException if user is already a member", async () => {
      const targetUserId = new Types.ObjectId().toString();
      const mockClan = {
        _id: new Types.ObjectId(),
        ownerId: new Types.ObjectId(user1),
        members: [{ userId: new Types.ObjectId(user1), role: "owner" }],
        memberIds: [new Types.ObjectId(user1), new Types.ObjectId(targetUserId)],
      };
      mockClanModel.findById.mockResolvedValue(mockClan);

      await expect(
        service.inviteMember(mockClan._id.toString(), user1, { userId: targetUserId })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("Service - joinClan", () => {
    it("should throw UnauthorizedException if private clan is joined without invite", async () => {
      const mockClan = {
        _id: new Types.ObjectId(),
        isPublic: false,
        memberIds: [],
        invites: [],
      };
      mockClanModel.findById.mockResolvedValue(mockClan);

      await expect(
        service.joinClan(mockClan._id.toString(), user1)
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("Service - leaveClan", () => {
    it("should throw BadRequestException if owner tries to leave", async () => {
      const mockClan = {
        _id: new Types.ObjectId(),
        ownerId: new Types.ObjectId(user1),
        memberIds: [new Types.ObjectId(user1)],
      };
      mockClanModel.findById.mockResolvedValue(mockClan);

      await expect(
        service.leaveClan(mockClan._id.toString(), user1)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("Service - kickMember", () => {
    it("should throw BadRequestException when trying to kick owner", async () => {
      const mockClan = {
        _id: new Types.ObjectId(),
        ownerId: new Types.ObjectId(user1),
        members: [{ userId: new Types.ObjectId(user1), role: "owner" }],
        memberIds: [new Types.ObjectId(user1)],
      };
      mockClanModel.findById.mockResolvedValue(mockClan);

      await expect(
        service.kickMember(mockClan._id.toString(), user1, user1)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("Service - updateMemberRole", () => {
    it("should throw BadRequestException when trying to change owner role", async () => {
      const mockClan = {
        _id: new Types.ObjectId(),
        ownerId: new Types.ObjectId(user1),
        members: [{ userId: new Types.ObjectId(user1), role: "owner" }],
        memberIds: [new Types.ObjectId(user1)],
      };
      mockClanModel.findById.mockResolvedValue(mockClan);

      await expect(
        service.updateMemberRole(mockClan._id.toString(), user1, {
          userId: user1,
          role: "admin",
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("Service - createEvent", () => {
    it("should throw UnauthorizedException if non-manager tries to create event", async () => {
      const mockClan = {
        _id: new Types.ObjectId(),
        ownerId: new Types.ObjectId(user1),
        members: [{ userId: new Types.ObjectId(user2), role: "member" }],
        memberIds: [new Types.ObjectId(user1), new Types.ObjectId(user2)],
      };
      mockClanModel.findById.mockResolvedValue(mockClan);

      await expect(
        service.createEvent(mockClan._id.toString(), user2, {
          title: "War event",
          startsAt: new Date().toISOString(),
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("Service - getClans", () => {
    it("should return a list of clans sorted by name", async () => {
      const mockClans = [{ name: "Clan A" }, { name: "Clan B" }];
      mockClanModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockClans),
      });

      const result = await service.getClans();
      expect(result).toBe(mockClans);
      expect(mockClanModel.find).toHaveBeenCalled();
    });
  });

  describe("Service - getClan", () => {
    it("should return a clan if it exists", async () => {
      const mockClan = { _id: new Types.ObjectId(), name: "Clan A" };
      mockClanModel.findById.mockResolvedValue(mockClan);

      const result = await service.getClan(mockClan._id.toString());
      expect(result).toBe(mockClan);
    });

    it("should throw NotFoundException if clan does not exist", async () => {
      mockClanModel.findById.mockResolvedValue(null);

      await expect(
        service.getClan(new Types.ObjectId().toString())
      ).rejects.toThrow(NotFoundException);
    });
  });
});
