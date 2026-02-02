import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MatchRequest, MatchRequestDocument } from "./schemas/match-request.schema";

@Injectable()
export class MatchingService {
  constructor(
    @InjectModel(MatchRequest.name)
    private readonly requestModel: Model<MatchRequestDocument>,
    private readonly configService: ConfigService
  ) {}

  async findCompatibleRequest(
    request: MatchRequestDocument
  ): Promise<MatchRequestDocument | null> {
    const query: Record<string, unknown> = {
      _id: { $ne: request._id },
      status: "queued",
      gameId: request.gameId,
      expiresAt: { $gt: new Date() },
      userId: { $ne: request.userId }
    };

    if (request.region) {
      query.region = request.region;
    }

    const maxSkillGap = this.configService.get<number>("MATCH_MAX_SKILL_GAP", {
      infer: true
    });

    if (typeof request.skill === "number") {
      query.skill = {
        $gte: Math.max(1, request.skill - maxSkillGap),
        $lte: Math.min(10, request.skill + maxSkillGap)
      };
    }

    const candidates = await this.requestModel
      .find(query)
      .sort({ createdAt: 1 })
      .limit(10);

    if (candidates.length === 0) {
      return null;
    }

    const defaultMaxPing = this.configService.get<number>("MATCH_MAX_PING_MS", {
      infer: true
    });

    return (
      candidates.find((candidate) =>
        this.isCompatible(request, candidate, maxSkillGap, defaultMaxPing)
      ) ?? null
    );
  }

  private isCompatible(
    request: MatchRequestDocument,
    candidate: MatchRequestDocument,
    maxSkillGap: number,
    defaultMaxPing: number
  ): boolean {
    if (
      typeof request.skill === "number" &&
      typeof candidate.skill === "number"
    ) {
      const gap = Math.abs(request.skill - candidate.skill);
      if (gap > maxSkillGap) {
        return false;
      }
    }

    const requestMaxPing = request.maxPingMs ?? defaultMaxPing;
    const candidateMaxPing = candidate.maxPingMs ?? defaultMaxPing;
    const allowedMaxPing = Math.min(requestMaxPing, candidateMaxPing);

    if (typeof request.pingMs === "number" && request.pingMs > allowedMaxPing) {
      return false;
    }

    if (
      typeof candidate.pingMs === "number" &&
      candidate.pingMs > allowedMaxPing
    ) {
      return false;
    }

    return true;
  }
}
