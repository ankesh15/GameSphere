import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import * as Joi from "joi";
import { AuthModule } from "./auth/auth.module";
import { ChatModule } from "./chat/chat.module";
import { ClanModule } from "./clan/clan.module";
import { LoggingMiddleware } from "./common/middleware/logging.middleware";
import { ErrorTrackingService } from "./common/monitoring/error-tracking.service";
import { HealthModule } from "./health/health.module";
import { MatchmakingModule } from "./matchmaking/matchmaking.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { TournamentModule } from "./tournament/tournament.module";
import { UsersModule } from "./users/users.module";
import { AiModule } from "./ai/ai.module";

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),
  PORT: Joi.number().default(3000),
  MONGODB_URI: Joi.string()
    .uri()
    .default("mongodb://localhost:27017/gamesphere"),
  JWT_SECRET: Joi.string()
    .min(16)
    .when("NODE_ENV", {
      is: "production",
      then: Joi.required(),
      otherwise: Joi.string().min(16).default("dev_only_change_me")
    }),
  JWT_EXPIRES_IN: Joi.string().default("1h"),
  JWT_REFRESH_SECRET: Joi.string()
    .min(16)
    .when("NODE_ENV", {
      is: "production",
      then: Joi.required(),
      otherwise: Joi.string().min(16).default("dev_only_change_me_refresh")
    }),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default("7d"),
  MATCH_MAX_SKILL_GAP: Joi.number().min(0).max(10).default(2),
  MATCH_MAX_PING_MS: Joi.number().min(0).max(1000).default(150),
  MATCH_REQUEST_TTL_SECONDS: Joi.number().min(30).default(600),
  MATCH_ACCEPT_TIMEOUT_SECONDS: Joi.number().min(10).default(90),
  AI_SERVICE_URL: Joi.string().uri().default("http://localhost:8000"),
  AI_SERVICE_API_KEY: Joi.string().allow("").optional(),
  AI_TIMEOUT_MS: Joi.number().min(100).default(4000),
  AI_CACHE_TTL_SECONDS: Joi.number().min(30).default(300),
  AI_CACHE_MAX: Joi.number().min(1).default(500),
  RATE_LIMIT_TTL_SECONDS: Joi.number().min(1).default(60),
  RATE_LIMIT_MAX: Joi.number().min(1).default(120),
  ERROR_TRACKING_DSN: Joi.string().allow("").optional()
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ttl =
          configService.get<number>("RATE_LIMIT_TTL_SECONDS", { infer: true }) ??
          60;
        const limit =
          configService.get<number>("RATE_LIMIT_MAX", { infer: true }) ?? 120;
        return {
          throttlers: [
            {
              ttl,
              limit
            }
          ]
        };
      }
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_URI", { infer: true }),
        appName: "gamesphere-api"
      })
    }),
    AuthModule,
    UsersModule,
    MatchmakingModule,
    TournamentModule,
    ClanModule,
    ChatModule,
    RealtimeModule,
    AiModule,
    HealthModule
  ],
  providers: [
    ErrorTrackingService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes("*");
  }
}
