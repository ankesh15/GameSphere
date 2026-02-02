import { CacheModule } from "@nestjs/cache-manager";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";

@Module({
  imports: [
    HttpModule,
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>("AI_CACHE_TTL_SECONDS", { infer: true }),
        max: configService.get<number>("AI_CACHE_MAX", { infer: true })
      })
    })
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService]
})
export class AiModule {}
