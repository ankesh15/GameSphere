import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateTournamentDto } from "./dto/create-tournament.dto";
import { SubmitMatchResultDto } from "./dto/submit-match-result.dto";
import { VerifyWinnerDto } from "./dto/verify-winner.dto";
import { Tournament, TournamentDocument } from "./schemas/tournament.schema";
import { GamerProfilesService } from "../users/gamer-profiles.service";

@Injectable()
export class TournamentService {
  private readonly logger = new Logger(TournamentService.name);

  constructor(
    @InjectModel(Tournament.name)
    private readonly tournamentModel: Model<TournamentDocument>,
    private readonly profilesService: GamerProfilesService
  ) {}

  getHealth() {
    return {
      status: "ok",
      module: "tournament",
      timestamp: new Date().toISOString()
    };
  }

  async createTournament(userId: string, payload: CreateTournamentDto) {
    try {
      return await this.tournamentModel.create({
        ...payload,
        organizerId: new Types.ObjectId(userId),
        participantIds: [],
        bracket: [],
        status: "scheduled"
      });
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException("Tournament slug already exists.");
      }
      throw error;
    }
  }

  async joinTournament(tournamentId: string, userId: string) {
    const tournament = await this.getTournamentOrThrow(tournamentId);
    if (tournament.status !== "scheduled") {
      throw new BadRequestException("Tournament is not open for joining.");
    }

    const alreadyJoined = tournament.participantIds.some(
      (id) => id.toString() === userId
    );
    if (alreadyJoined) {
      return tournament;
    }

    if (
      tournament.maxParticipants &&
      tournament.participantIds.length >= tournament.maxParticipants
    ) {
      throw new BadRequestException("Tournament is full.");
    }

    tournament.participantIds.push(new Types.ObjectId(userId));
    await tournament.save();
    return tournament;
  }

  async leaveTournament(tournamentId: string, userId: string) {
    const tournament = await this.getTournamentOrThrow(tournamentId);
    if (tournament.status !== "scheduled") {
      throw new BadRequestException("Tournament has already started.");
    }

    tournament.participantIds = tournament.participantIds.filter(
      (id) => id.toString() !== userId
    );
    await tournament.save();
    return tournament;
  }

  async generateBracket(tournamentId: string, userId: string) {
    const tournament = await this.getTournamentOrThrow(tournamentId);
    if (tournament.organizerId.toString() !== userId) {
      throw new UnauthorizedException("Only the organizer can generate brackets.");
    }

    if (tournament.bracket.length > 0) {
      return tournament.bracket;
    }

    const participants = [...tournament.participantIds];
    if (participants.length < 2) {
      throw new BadRequestException("Not enough participants to generate bracket.");
    }

    const rounds = this.buildBracket(participants);
    tournament.bracket = rounds;
    tournament.status = "live";
    await tournament.save();
    return tournament.bracket;
  }

  async submitMatchResult(
    tournamentId: string,
    userId: string,
    payload: SubmitMatchResultDto
  ) {
    const tournament = await this.getTournamentOrThrow(tournamentId);
    const match = this.findMatch(tournament, payload.matchId);

    if (!match.participantIds.some((id) => id.toString() === userId)) {
      throw new UnauthorizedException("Not a participant in this match.");
    }

    if (match.status === "verified" || match.status === "bye") {
      throw new BadRequestException("Match is already finalized.");
    }

    if (match.participantIds.length < 2) {
      throw new BadRequestException("Match does not have enough participants.");
    }

    if (!match.participantIds.some((id) => id.toString() === payload.winnerId)) {
      throw new BadRequestException("Winner must be a match participant.");
    }

    match.scores = payload.scores;
    match.winnerId = new Types.ObjectId(payload.winnerId);
    match.status = "submitted";
    match.reportedBy = new Types.ObjectId(userId);
    match.reportedAt = new Date();

    await tournament.save();
    return match;
  }

  async verifyWinner(
    tournamentId: string,
    user: { sub: string; roles?: string[] },
    payload: VerifyWinnerDto
  ) {
    const tournament = await this.getTournamentOrThrow(tournamentId);
    const isOrganizer = tournament.organizerId.toString() === user.sub;
    const hasRole = user.roles?.includes("admin") || user.roles?.includes("organizer");
    if (!isOrganizer && !hasRole) {
      throw new UnauthorizedException("Not authorized to verify results.");
    }

    const matchInfo = this.findMatchWithRound(tournament, payload.matchId);
    const match = matchInfo.match;

    if (match.status === "bye") {
      return match;
    }

    if (match.status !== "submitted" && match.status !== "verified") {
      throw new BadRequestException("Match results have not been submitted.");
    }

    if (match.participantIds.length < 2) {
      throw new BadRequestException("Match does not have enough participants.");
    }

    if (!match.participantIds.some((id) => id.toString() === payload.winnerId)) {
      throw new BadRequestException("Winner must be a match participant.");
    }

    match.winnerId = new Types.ObjectId(payload.winnerId);
    match.status = "verified";

    this.advanceWinner(tournament, matchInfo.roundIndex, matchInfo.matchIndex);

    const winnerId = this.resolveTournamentWinner(tournament);
    if (winnerId) {
      tournament.winnerId = winnerId;
      tournament.status = "completed";
      try {
        await this.profilesService.awardBadge(winnerId.toString(), {
          code: "tournament-winner",
          label: "Tournament Winner",
          source: `tournament:${tournament._id.toString()}`
        });
      } catch (error) {
        this.logger.warn("Failed to award tournament badge.");
      }
    }

    await tournament.save();
    return match;
  }

  private buildBracket(participants: Types.ObjectId[]) {
    const size = this.nextPowerOfTwo(participants.length);
    const byes = size - participants.length;
    const seeded: Array<Types.ObjectId | null> = [...participants];
    for (let i = 0; i < byes; i += 1) {
      seeded.push(null);
    }

    const rounds: Tournament["bracket"] = [];
    const roundCount = Math.log2(size);
    let roundParticipants: Array<Types.ObjectId | null> = seeded;

    for (let round = 1; round <= roundCount; round += 1) {
      const matches = [];
      for (let i = 0; i < roundParticipants.length; i += 2) {
        const participantIds = [roundParticipants[i], roundParticipants[i + 1]]
          .filter((id): id is Types.ObjectId => Boolean(id));
        const isBye = round === 1 && participantIds.length === 1;
        matches.push({
          matchId: this.generateMatchId(),
          participantIds: participantIds as Types.ObjectId[],
          scores: [] as number[],
          winnerId: isBye ? participantIds[0] : undefined,
          status: (isBye ? "bye" : "pending") as "bye" | "pending"
        });
      }

      rounds.push({
        round,
        matches
      });

      roundParticipants = matches.map((match) => match.winnerId ?? null);
    }

    return rounds;
  }

  private findMatch(tournament: TournamentDocument, matchId: string) {
    for (const round of tournament.bracket) {
      const match = round.matches.find((item) => item.matchId === matchId);
      if (match) {
        return match;
      }
    }
    throw new NotFoundException("Match not found.");
  }

  private findMatchWithRound(tournament: TournamentDocument, matchId: string) {
    for (let roundIndex = 0; roundIndex < tournament.bracket.length; roundIndex += 1) {
      const round = tournament.bracket[roundIndex];
      const matchIndex = round.matches.findIndex((item) => item.matchId === matchId);
      if (matchIndex >= 0) {
        return {
          roundIndex,
          matchIndex,
          match: round.matches[matchIndex]
        };
      }
    }
    throw new NotFoundException("Match not found.");
  }

  private advanceWinner(
    tournament: TournamentDocument,
    roundIndex: number,
    matchIndex: number
  ) {
    const nextRound = tournament.bracket[roundIndex + 1];
    if (!nextRound) {
      return;
    }

    const nextMatchIndex = Math.floor(matchIndex / 2);
    const nextMatch = nextRound.matches[nextMatchIndex];
    if (!nextMatch) {
      return;
    }

    const winnerId = tournament.bracket[roundIndex].matches[matchIndex].winnerId;
    if (!winnerId) {
      return;
    }

    const participants = nextMatch.participantIds.map((id) => id.toString());
    if (!participants.includes(winnerId.toString())) {
      nextMatch.participantIds.push(winnerId);
    }
  }

  private resolveTournamentWinner(tournament: TournamentDocument): Types.ObjectId | null {
    const lastRound = tournament.bracket[tournament.bracket.length - 1];
    if (!lastRound) {
      return null;
    }

    const finalMatch = lastRound.matches[0];
    if (finalMatch?.status === "verified" && finalMatch.winnerId) {
      return finalMatch.winnerId;
    }
    return null;
  }

  private nextPowerOfTwo(value: number): number {
    return Math.pow(2, Math.ceil(Math.log2(value)));
  }

  private generateMatchId(): string {
    return `match_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private async getTournamentOrThrow(tournamentId: string): Promise<TournamentDocument> {
    const tournament = await this.tournamentModel.findById(tournamentId);
    if (!tournament) {
      throw new NotFoundException("Tournament not found.");
    }
    return tournament;
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return Boolean(
      typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: number }).code === 11000
    );
  }
}
