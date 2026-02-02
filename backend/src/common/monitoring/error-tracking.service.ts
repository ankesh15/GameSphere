import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type TrackingContext = {
  path?: string;
  method?: string;
  status?: number;
  requestId?: string;
};

@Injectable()
export class ErrorTrackingService {
  private readonly logger = new Logger(ErrorTrackingService.name);

  constructor(private readonly configService: ConfigService) {}

  trackError(error: unknown, context: TrackingContext): void {
    const dsn = this.configService.get<string>("ERROR_TRACKING_DSN", {
      infer: true
    });

    if (!dsn) {
      this.logger.warn(
        `Error tracked (no DSN configured): ${context.method ?? ""} ${context.path ?? ""}`
      );
      return;
    }

    // Placeholder for future integration (e.g., Sentry).
    this.logger.warn(
      `Error tracked to DSN (${dsn}): ${context.method ?? ""} ${context.path ?? ""}`
    );
  }
}
