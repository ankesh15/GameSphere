import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { RealtimeService } from "../realtime/realtime.service";
import { CreateMatchRequestPayload, MatchRequestResponse } from "./matchmaking.types";
import { MatchRequest, MatchRequestDocument } from "./schemas/match-request.schema";
import { MatchSession, MatchSessionDocument } from "./schemas/match-session.schema";
import { MatchingService } from "./matching.service";

@Injectable()
export class MatchmakingService implements OnModuleInit {
  private readonly logger = new Logger(MatchmakingService.name);

  constructor(
    @InjectModel(MatchRequest.name)
    private readonly requestModel: Model<MatchRequestDocument>,
    @InjectModel(MatchSession.name)
    private readonly sessionModel: Model<MatchSessionDocument>,
    private readonly matchingService: MatchingService,
    private readonly configService: ConfigService,
    private readonly realtimeService: RealtimeService
  ) {}

  async createRequest(payload: CreateMatchRequestPayload): Promise<MatchRequestResponse> {
    const ttlSeconds = this.configService.get<number>("MATCH_REQUEST_TTL_SECONDS", {
      infer: true
    });
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const defaultMaxPing = this.configService.get<number>("MATCH_MAX_PING_MS", {
      infer: true
    });

    if (
      typeof payload.maxPingMs === "number" &&
      typeof payload.pingMs === "number" &&
      payload.pingMs > payload.maxPingMs
    ) {
      throw new BadRequestException("pingMs cannot exceed maxPingMs.");
    }

    const request = await this.requestModel.create({
      ...payload,
      maxPingMs: payload.maxPingMs ?? defaultMaxPing,
      status: "queued",
      expiresAt
    });

    const candidate = await this.matchingService.findCompatibleRequest(request);
    if (!candidate) {
      return {
        requestId: request.id,
        status: "queued",
        estimatedWaitSeconds: await this.estimateWaitSeconds(payload.gameId)
      };
    }

    const sessionId = new Types.ObjectId();
    const reservedCandidate = await this.requestModel.findOneAndUpdate(
      { _id: candidate._id, status: "queued" },
      { $set: { status: "matched", matchSessionId: sessionId } },
      { new: true }
    );

    if (!reservedCandidate) {
      return {
        requestId: request.id,
        status: "queued",
        estimatedWaitSeconds: await this.estimateWaitSeconds(payload.gameId)
      };
    }

    await this.requestModel.updateOne(
      { _id: request._id },
      { $set: { status: "matched", matchSessionId: sessionId } }
    );

    const acceptTimeoutSeconds = this.configService.get<number>(
      "MATCH_ACCEPT_TIMEOUT_SECONDS",
      { infer: true }
    );
    const sessionExpiresAt = new Date(Date.now() + acceptTimeoutSeconds * 1000);
    try {
      const session = await this.sessionModel.create({
        _id: sessionId,
        gameId: request.gameId,
        region: request.region ?? reservedCandidate.region,
        playerIds: [request.userId, reservedCandidate.userId],
        requestIds: [request._id, reservedCandidate._id],
        status: "pending",
        acceptedBy: [],
        declinedBy: [],
        expiresAt: sessionExpiresAt
      });

      await this.notifyMatchOffer(session);

      return {
        requestId: request.id,
        status: "matched",
        matchSessionId: session._id.toString(),
        estimatedWaitSeconds: 0
      };
    } catch (error) {
      this.logger.error(
        "Failed to create match session",
        error instanceof Error ? error.stack : undefined
      );
      await this.requestModel.updateMany(
        { _id: { $in: [request._id, reservedCandidate._id] } },
        { $set: { status: "queued" }, $unset: { matchSessionId: "" } }
      );
      return {
        requestId: request.id,
        status: "queued",
        estimatedWaitSeconds: await this.estimateWaitSeconds(payload.gameId)
      };
    }
  }

  async acceptMatch(sessionId: string, userId: string): Promise<MatchSessionDocument> {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException("Match session not found.");
    }

    if (!session.playerIds.some((id) => id.toString() === userId)) {
      throw new UnauthorizedException("Not authorized for this session.");
    }

    if (session.status !== "pending") {
      return session;
    }

    if (!session.acceptedBy.some((id) => id.toString() === userId)) {
      session.acceptedBy.push(new Types.ObjectId(userId));
    }

    const allAccepted = session.acceptedBy.length >= session.playerIds.length;
    if (allAccepted) {
      session.status = "active";
      session.startedAt = new Date();
      session.expiresAt = undefined;
    }

    await session.save();

    if (allAccepted) {
      await this.notifyMatchStarted(session);
    } else {
      await this.notifyMatchAccepted(session, userId);
    }

    return session;
  }

  async declineMatch(
    sessionId: string,
    userId: string
  ): Promise<MatchSessionDocument> {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException("Match session not found.");
    }

    if (!session.playerIds.some((id) => id.toString() === userId)) {
      throw new UnauthorizedException("Not authorized for this session.");
    }

    if (session.status !== "pending") {
      return session;
    }

    if (!session.declinedBy.some((id) => id.toString() === userId)) {
      session.declinedBy.push(new Types.ObjectId(userId));
    }
    session.status = "declined";
    session.endedAt = new Date();
    session.expiresAt = undefined;
    await session.save();

    await this.requestModel.updateMany(
      { _id: { $in: session.requestIds } },
      { $set: { status: "queued" }, $unset: { matchSessionId: "" } }
    );

    await this.notifyMatchDeclined(session, userId);
    return session;
  }

  async completeMatch(
    sessionId: string,
    userId: string
  ): Promise<MatchSessionDocument> {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException("Match session not found.");
    }

    if (!session.playerIds.some((id) => id.toString() === userId)) {
      throw new UnauthorizedException("Not authorized for this session.");
    }

    if (session.status === "completed") {
      return session;
    }

    session.status = "completed";
    session.endedAt = new Date();
    await session.save();

    await this.requestModel.updateMany(
      { _id: { $in: session.requestIds } },
      { $set: { status: "expired" } }
    );

    await this.notifyMatchCompleted(session);
    return session;
  }

  async getSession(sessionId: string, userId: string): Promise<MatchSessionDocument> {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException("Match session not found.");
    }
    if (!session.playerIds.some((id) => id.toString() === userId)) {
      throw new UnauthorizedException("Not authorized for this session.");
    }
    return session;
  }

  async getMyMatchSessions(userId: string, status?: string): Promise<MatchSessionDocument[]> {
    const userObjId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const filter: Record<string, any> = {
      $or: [
        { playerIds: userObjId },
        { playerIds: userId }
      ]
    };
    if (status) {
      filter.status = status;
    }
    return this.sessionModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(20);
  }

  private async notifyMatchOffer(session: MatchSessionDocument): Promise<void> {
    const payload = this.buildSessionPayload(session);
    await this.realtimeService.emitToUsers(
      session.playerIds.map((id) => id.toString()),
      "match.offer",
      payload
    );
  }

  private async notifyMatchAccepted(
    session: MatchSessionDocument,
    acceptedByUserId: string
  ): Promise<void> {
    await this.realtimeService.emitToUsers(
      session.playerIds.map((id) => id.toString()),
      "match.accepted",
      {
        sessionId: session._id.toString(),
        acceptedBy: acceptedByUserId
      }
    );
  }

  private async notifyMatchStarted(session: MatchSessionDocument): Promise<void> {
    await this.realtimeService.emitToUsers(
      session.playerIds.map((id) => id.toString()),
      "match.started",
      this.buildSessionPayload(session)
    );
  }

  private async notifyMatchDeclined(
    session: MatchSessionDocument,
    declinedByUserId: string
  ): Promise<void> {
    await this.realtimeService.emitToUsers(
      session.playerIds.map((id) => id.toString()),
      "match.declined",
      {
        sessionId: session._id.toString(),
        declinedBy: declinedByUserId
      }
    );
  }

  private async notifyMatchCompleted(session: MatchSessionDocument): Promise<void> {
    await this.realtimeService.emitToUsers(
      session.playerIds.map((id) => id.toString()),
      "match.completed",
      {
        sessionId: session._id.toString(),
        status: "completed"
      }
    );
  }

  private buildSessionPayload(session: MatchSessionDocument) {
    return {
      sessionId: session._id.toString(),
      gameId: session.gameId,
      region: session.region ?? null,
      playerIds: session.playerIds.map((id) => id.toString()),
      status: session.status,
      acceptedBy: session.acceptedBy.map((id) => id.toString()),
      expiresAt: session.expiresAt?.toISOString() ?? null
    };
  }

  private async estimateWaitSeconds(gameId: string): Promise<number> {
    const queuedCount = await this.requestModel.countDocuments({
      gameId,
      status: "queued"
    });
    return Math.max(30, queuedCount * 12);
  }

  onModuleInit() {
    setInterval(() => {
      this.expireMatchSessions().catch((err) => {
        this.logger.error("Error auto-expiring match sessions", err);
      });
    }, 5000);
  }

  async cancelRequest(requestId: string, userId: string): Promise<any> {
    const request = await this.requestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException("Matchmaking request not found.");
    }
    if (request.userId.toString() !== userId) {
      throw new ForbiddenException("You do not own this matchmaking request.");
    }
    if (request.status !== "queued") {
      throw new BadRequestException("Request is not active.");
    }
    request.status = "cancelled";
    await request.save();
    return { success: true, message: "Matchmaking request cancelled." };
  }

  async getCurrentRequest(userId: string): Promise<any> {
    const request = await this.requestModel.findOne({
      userId,
      status: { $in: ["queued", "matched"] }
    }).sort({ createdAt: -1 });

    if (!request) {
      throw new NotFoundException("No active matchmaking request found.");
    }
    return request;
  }

  async expireMatchSessions(): Promise<void> {
    const expiredSessions = await this.sessionModel.find({
      status: "pending",
      expiresAt: { $lt: new Date() }
    });

    for (const session of expiredSessions) {
      session.status = "expired" as any;
      session.endedAt = new Date();
      session.expiresAt = undefined;
      await session.save();

      await this.requestModel.updateMany(
        { _id: { $in: session.requestIds } },
        { $set: { status: "expired" }, $unset: { matchSessionId: "" } }
      );

      await this.notifyMatchExpired(session);
    }
  }

  private async notifyMatchExpired(session: MatchSessionDocument): Promise<void> {
    await this.realtimeService.emitToUsers(
      session.playerIds.map((id) => id.toString()),
      "match.expired",
      {
        sessionId: session._id.toString()
      }
    );
  }
}
