import { HttpService } from "@nestjs/axios";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cache } from "cache-manager";
import { createHash } from "crypto";
import { firstValueFrom } from "rxjs";
import { RecommendDto } from "./dto/recommend.dto";

type RecommendationItem = {
  id: string;
  score: number;
  reason: string;
};

type RecommendResponse = {
  games: RecommendationItem[];
  teammates: RecommendationItem[];
  extracted_interests: string[];
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async recommend(userId: string, payload: RecommendDto): Promise<RecommendResponse> {
    const normalizedPayload = this.buildAiPayload(userId, payload);
    const cacheKey = this.buildCacheKey(userId, normalizedPayload);
    const cached = await this.cacheManager.get<RecommendResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.callAiService(normalizedPayload);
    const ttl =
      this.configService.get<number>("AI_CACHE_TTL_SECONDS", {
        infer: true
      }) ?? 300;

    if (response) {
      await this.cacheManager.set(cacheKey, response, ttl);
      return response;
    }

    const fallback = this.buildFallback(payload);
    await this.cacheManager.set(cacheKey, fallback, ttl);
    return fallback;
  }

  private async callAiService(payload: Record<string, unknown>) {
    const baseUrl = this.configService.get<string>("AI_SERVICE_URL", {
      infer: true
    });
    const apiKey = this.configService.get<string>("AI_SERVICE_API_KEY", {
      infer: true
    });
    const timeoutMs = this.configService.get<number>("AI_TIMEOUT_MS", {
      infer: true
    });

    if (!baseUrl) {
      return null;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${baseUrl}/recommend`, payload, {
          timeout: timeoutMs,
          headers: apiKey ? { "x-api-key": apiKey } : undefined
        })
      );
      return response.data as RecommendResponse;
    } catch (error) {
      this.logger.warn("AI service request failed, using fallback.");
      return null;
    }
  }

  private buildAiPayload(userId: string, payload: RecommendDto) {
    return {
      user_id: userId,
      user_history: (payload.userHistory ?? []).map((item) => ({
        game_id: item.gameId,
        hours_played: item.hoursPlayed ?? 0,
        liked: item.liked ?? null,
        tags: item.tags ?? []
      })),
      preferences: payload.preferences
        ? {
            genres: payload.preferences.genres ?? [],
            modes: payload.preferences.modes ?? [],
            platforms: payload.preferences.platforms ?? [],
            playstyle: payload.preferences.playstyle ?? [],
            free_text: payload.preferences.freeText ?? null,
            region: payload.preferences.region ?? null
          }
        : null,
      match_success: (payload.matchSuccess ?? []).map((item) => ({
        teammate_id: item.teammateId,
        game_id: item.gameId,
        success_score: item.successScore
      })),
      community_profiles: (payload.communityProfiles ?? []).map((profile) => ({
        user_id: profile.userId,
        history: (profile.history ?? []).map((item) => ({
          game_id: item.gameId,
          hours_played: item.hoursPlayed ?? 0,
          liked: item.liked ?? null,
          tags: item.tags ?? []
        })),
        preferences: profile.preferences
          ? {
              genres: profile.preferences.genres ?? [],
              modes: profile.preferences.modes ?? [],
              platforms: profile.preferences.platforms ?? [],
              playstyle: profile.preferences.playstyle ?? [],
              free_text: profile.preferences.freeText ?? null,
              region: profile.preferences.region ?? null
            }
          : null
      })),
      games_catalog: (payload.gamesCatalog ?? []).map((game) => ({
        game_id: game.gameId,
        title: game.title,
        tags: game.tags ?? [],
        genres: game.genres ?? [],
        modes: game.modes ?? []
      }))
    };
  }

  private buildCacheKey(userId: string, payload: Record<string, unknown>) {
    const hash = createHash("sha256")
      .update(this.stableStringify(payload))
      .digest("hex");
    return `ai:recommend:${userId}:${hash}`;
  }

  private stableStringify(value: unknown): string {
    if (Array.isArray(value)) {
      return `[${value.map((item) => this.stableStringify(item)).join(",")}]`;
    }
    if (value && typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>).sort((a, b) =>
        a[0].localeCompare(b[0])
      );
      return `{${entries
        .map(([key, val]) => `${key}:${this.stableStringify(val)}`)
        .join(",")}}`;
    }
    return String(value ?? "");
  }

  private buildFallback(payload: RecommendDto): RecommendResponse {
    const userHistory = payload.userHistory ?? [];
    const preferences = payload.preferences;
    const matchSuccess = payload.matchSuccess ?? [];
    const catalog = payload.gamesCatalog ?? [];
    const targetGameIds = new Set(userHistory.map((item) => item.gameId));

    const interests = this.extractInterests(preferences, userHistory);
    const gameScores: Array<RecommendationItem> = [];

    if (catalog.length > 0 && interests.length > 0) {
      const interestSet = new Set(interests.map((item) => item.toLowerCase()));
      for (const game of catalog) {
        if (targetGameIds.has(game.gameId)) {
          continue;
        }
        const tags = [
          ...(game.tags ?? []),
          ...(game.genres ?? []),
          ...(game.modes ?? [])
        ].map((item) => item.toLowerCase());
        const overlap = tags.filter((item) => interestSet.has(item));
        if (overlap.length > 0) {
          gameScores.push({
            id: game.gameId,
            score: Math.min(1, overlap.length / Math.max(1, interestSet.size)),
            reason: "Matches your interests."
          });
        }
      }
    }

    const games = gameScores.sort((a, b) => b.score - a.score).slice(0, 5);

    const teammateScores = new Map<string, number[]>();
    for (const item of matchSuccess) {
      if (!teammateScores.has(item.teammateId)) {
        teammateScores.set(item.teammateId, []);
      }
      teammateScores.get(item.teammateId)!.push(item.successScore);
    }

    const teammates = Array.from(teammateScores.entries())
      .map(([teammateId, scores]) => ({
        id: teammateId,
        score: scores.reduce((sum, value) => sum + value, 0) / scores.length,
        reason: "Strong recent match performance."
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      games,
      teammates,
      extracted_interests: interests
    };
  }

  private extractInterests(preferences: RecommendDto["preferences"], history: RecommendDto["userHistory"]): string[] {
    const tokens: string[] = [];
    if (preferences) {
      tokens.push(...(preferences.genres ?? []));
      tokens.push(...(preferences.modes ?? []));
      tokens.push(...(preferences.platforms ?? []));
      tokens.push(...(preferences.playstyle ?? []));
      if (preferences.freeText) {
        tokens.push(...this.tokenize(preferences.freeText));
      }
    }
    for (const item of history ?? []) {
      tokens.push(...(item.tags ?? []));
    }

    const normalized = tokens
      .map((token) => token.toLowerCase())
      .filter((token) => token.length >= 3);

    return Array.from(new Set(normalized)).slice(0, 20);
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/[^a-z0-9#\+]+/g)
      .filter((token) => token.length >= 3);
  }
}
