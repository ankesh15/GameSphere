import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { BadRequestException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Types } from "mongoose";
import { TournamentService } from "./tournament.service";
import { TournamentController } from "./tournament.controller";
import { Tournament } from "./schemas/tournament.schema";
import { GamerProfilesService } from "../users/gamer-profiles.service";
import { NotificationsService } from "../notifications/notifications.service";

describe("Tournament Retrieve Gaps & Core Logic", () => {
  let service: TournamentService;
  let controller: TournamentController;

  const mockTournamentModel = {
    findById: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  };

  const mockProfilesService = {
    awardBadge: jest.fn().mockResolvedValue(true),
  };

  const mockNotificationsService = {
    create: jest.fn().mockImplementation(() => ({
      catch: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TournamentController],
      providers: [
        TournamentService,
        {
          provide: getModelToken(Tournament.name),
          useValue: mockTournamentModel,
        },
        {
          provide: GamerProfilesService,
          useValue: mockProfilesService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<TournamentService>(TournamentService);
    controller = module.get<TournamentController>(TournamentController);

    jest.clearAllMocks();
  });

  describe("Service - getTournament", () => {
    it("should return the tournament when found (live/in-progress)", async () => {
      const mockTournament = {
        _id: new Types.ObjectId(),
        name: "Pro League",
        slug: "pro-league",
        gameId: "cs2",
        status: "live",
        participantIds: [
          { _id: new Types.ObjectId(), username: "GamerOne" },
          { _id: new Types.ObjectId(), username: "GamerTwo" }
        ],
        bracket: [
          {
            round: 1,
            matches: [
              {
                matchId: "m1",
                participantIds: [new Types.ObjectId(), new Types.ObjectId()],
                status: "pending",
              },
            ],
          },
        ],
      };

      mockTournamentModel.findById.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockTournament)
      }));

      const result = await service.getTournament(mockTournament._id.toString());
      expect(result).toBe(mockTournament);
    });

    it("should throw NotFoundException if tournament is not found", async () => {
      mockTournamentModel.findById.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(null)
      }));

      await expect(
        service.getTournament(new Types.ObjectId().toString())
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("Service - generateBracket", () => {
    it("should throw UnauthorizedException if user is not organizer", async () => {
      const mockTournament = {
        organizerId: new Types.ObjectId("60b9f7831f2c2534f40f06a1"),
      };
      mockTournamentModel.findById.mockImplementation(() => ({
        then: (resolve: any) => resolve(mockTournament),
      }));

      await expect(
        service.generateBracket(new Types.ObjectId().toString(), "60b9f7831f2c2534f40f06a2")
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw BadRequestException if not enough participants", async () => {
      const mockTournament = {
        organizerId: new Types.ObjectId("60b9f7831f2c2534f40f06a1"),
        participantIds: [new Types.ObjectId()],
        bracket: [],
      };
      mockTournamentModel.findById.mockImplementation(() => ({
        then: (resolve: any) => resolve(mockTournament),
      }));

      await expect(
        service.generateBracket(new Types.ObjectId().toString(), "60b9f7831f2c2534f40f06a1")
      ).rejects.toThrow(BadRequestException);
    });

    it("should successfully build a bracket with BYEs for non-power-of-two (3) participants", async () => {
      const p1 = new Types.ObjectId();
      const p2 = new Types.ObjectId();
      const p3 = new Types.ObjectId();
      const mockTournament = {
        _id: new Types.ObjectId(),
        name: "Trial Tourney",
        organizerId: new Types.ObjectId("60b9f7831f2c2534f40f06a1"),
        participantIds: [p1, p2, p3],
        bracket: [],
        status: "pending",
        save: jest.fn().mockResolvedValue(true),
      };

      mockTournamentModel.findById.mockImplementation(() => ({
        then: (resolve: any) => resolve(mockTournament),
      }));

      const bracket = await service.generateBracket(mockTournament._id.toString(), "60b9f7831f2c2534f40f06a1");

      expect(bracket).toHaveLength(2); // log2(4) = 2 rounds
      // Round 1 matches
      expect(bracket[0].matches).toHaveLength(2);
      // Match 1: p1 vs p2 (pending)
      expect(bracket[0].matches[0].participantIds).toContainEqual(p1);
      expect(bracket[0].matches[0].participantIds).toContainEqual(p2);
      expect(bracket[0].matches[0].status).toBe("pending");
      // Match 2: p3 (bye)
      expect(bracket[0].matches[1].participantIds).toContainEqual(p3);
      expect(bracket[0].matches[1].status).toBe("bye");
      expect(bracket[0].matches[1].winnerId).toEqual(p3);
    });
  });

  describe("Service - submitMatchResult", () => {
    it("should throw UnauthorizedException if submitter is not in match", async () => {
      const p1 = new Types.ObjectId();
      const p2 = new Types.ObjectId();
      const mockTournament = {
        bracket: [
          {
            round: 1,
            matches: [{ matchId: "m1", participantIds: [p1, p2], status: "pending" }],
          },
        ],
      };
      mockTournamentModel.findById.mockImplementation(() => ({
        then: (resolve: any) => resolve(mockTournament),
      }));

      await expect(
        service.submitMatchResult(new Types.ObjectId().toString(), "60b9f7831f2c2534f40f06a1", {
          matchId: "m1",
          winnerId: p1.toString(),
          scores: [2, 1],
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw BadRequestException if winner is not a match participant", async () => {
      const p1 = new Types.ObjectId();
      const p2 = new Types.ObjectId();
      const mockTournament = {
        bracket: [
          {
            round: 1,
            matches: [{ matchId: "m1", participantIds: [p1, p2], status: "pending" }],
          },
        ],
      };
      mockTournamentModel.findById.mockImplementation(() => ({
        then: (resolve: any) => resolve(mockTournament),
      }));

      await expect(
        service.submitMatchResult(new Types.ObjectId().toString(), p1.toString(), {
          matchId: "m1",
          winnerId: new Types.ObjectId().toString(),
          scores: [2, 1],
        })
      ).rejects.toThrow(BadRequestException);
    });

    it("should submit results successfully", async () => {
      const p1 = new Types.ObjectId();
      const p2 = new Types.ObjectId();
      const mockTournament = {
        bracket: [
          {
            round: 1,
            matches: [{ matchId: "m1", participantIds: [p1, p2], status: "pending" }],
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };
      mockTournamentModel.findById.mockImplementation(() => ({
        then: (resolve: any) => resolve(mockTournament),
      }));

      const match = await service.submitMatchResult(new Types.ObjectId().toString(), p1.toString(), {
        matchId: "m1",
        winnerId: p1.toString(),
        scores: [2, 1],
      });

      expect(match.status).toBe("submitted");
      expect(match.winnerId).toEqual(p1);
    });
  });

  describe("Service - verifyWinner", () => {
    it("should throw UnauthorizedException if user is not organizer or admin", async () => {
      const mockTournament = {
        organizerId: new Types.ObjectId("60b9f7831f2c2534f40f06a1"),
      };
      mockTournamentModel.findById.mockImplementation(() => ({
        then: (resolve: any) => resolve(mockTournament),
      }));

      await expect(
        service.verifyWinner(new Types.ObjectId().toString(), { sub: "60b9f7831f2c2534f40f06a2", roles: [] }, {
          matchId: "m1",
          winnerId: "some-winner",
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should advance winner to next round when verifying non-final round match", async () => {
      const p1 = new Types.ObjectId();
      const p2 = new Types.ObjectId();
      const mockTournament = {
        _id: new Types.ObjectId(),
        organizerId: new Types.ObjectId("60b9f7831f2c2534f40f06a1"),
        bracket: [
          {
            round: 1,
            matches: [{ matchId: "m1", participantIds: [p1, p2], status: "submitted", winnerId: p1 }],
          },
          {
            round: 2,
            matches: [{ matchId: "m2", participantIds: [], status: "pending" }],
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };
      mockTournamentModel.findById.mockImplementation(() => ({
        then: (resolve: any) => resolve(mockTournament),
      }));

      const match = await service.verifyWinner(
        mockTournament._id.toString(),
        { sub: "60b9f7831f2c2534f40f06a1", roles: [] },
        { matchId: "m1", winnerId: p1.toString() }
      );

      expect(match.status).toBe("verified");
      expect(mockTournament.bracket[1].matches[0].participantIds).toContainEqual(p1);
    });

    it("should complete tournament and award badge when verifying final round match", async () => {
      const p1 = new Types.ObjectId();
      const p2 = new Types.ObjectId();
      const mockTournament = {
        _id: new Types.ObjectId(),
        name: "Championship",
        organizerId: new Types.ObjectId("60b9f7831f2c2534f40f06a1"),
        participantIds: [p1, p2],
        bracket: [
          {
            round: 1,
            matches: [{ matchId: "m1", participantIds: [p1, p2], status: "submitted", winnerId: p1 }],
          },
        ],
        save: jest.fn().mockResolvedValue(true),
        status: "live",
        winnerId: undefined,
      };
      mockTournamentModel.findById.mockImplementation(() => ({
        then: (resolve: any) => resolve(mockTournament),
      }));

      const match = await service.verifyWinner(
        mockTournament._id.toString(),
        { sub: "60b9f7831f2c2534f40f06a1", roles: [] },
        { matchId: "m1", winnerId: p1.toString() }
      );

      expect(match.status).toBe("verified");
      expect(mockTournament.status).toBe("completed");
      expect(mockTournament.winnerId).toEqual(p1);
      expect(mockProfilesService.awardBadge).toHaveBeenCalledWith(p1.toString(), expect.any(Object));
      expect(match.badgeAwarded).toBe(true);
    });

    it("should return badgeAwarded: false and badgeError when awardBadge throws NotFoundException", async () => {
      const p1 = new Types.ObjectId();
      const p2 = new Types.ObjectId();
      const mockTournament = {
        _id: new Types.ObjectId(),
        name: "Championship",
        organizerId: new Types.ObjectId("60b9f7831f2c2534f40f06a1"),
        participantIds: [p1, p2],
        bracket: [
          {
            round: 1,
            matches: [{ matchId: "m1", participantIds: [p1, p2], status: "submitted", winnerId: p1 }],
          },
        ],
        save: jest.fn().mockResolvedValue(true),
        status: "live",
        winnerId: undefined,
      };
      mockTournamentModel.findById.mockImplementation(() => ({
        then: (resolve: any) => resolve(mockTournament),
      }));

      mockProfilesService.awardBadge.mockRejectedValueOnce(new NotFoundException("Profile not found."));

      const result = await service.verifyWinner(
        mockTournament._id.toString(),
        { sub: "60b9f7831f2c2534f40f06a1", roles: [] },
        { matchId: "m1", winnerId: p1.toString() }
      );

      expect(result.status).toBe("verified");
      expect(result.badgeAwarded).toBe(false);
      expect(result.badgeError).toContain("Gamer profile not found for winner");
    });
  });

  describe("Service - getTournaments", () => {
    it("should return a list of tournaments populated with participantIds sorted by createdAt desc", async () => {
      const mockTournaments = [
        { name: "Tourney 1", createdAt: new Date() },
        { name: "Tourney 2", createdAt: new Date() },
      ];
      mockTournamentModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockTournaments),
        }),
      });

      const result = await service.getTournaments();
      expect(result).toBe(mockTournaments);
      expect(mockTournamentModel.find).toHaveBeenCalled();
    });
  });
});
