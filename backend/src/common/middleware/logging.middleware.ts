import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const requestId = randomUUID();
    const startTime = Date.now();

    response.setHeader("x-request-id", requestId);

    response.on("finish", () => {
      const durationMs = Date.now() - startTime;
      const userAgent = request.get("user-agent") ?? "unknown";
      const ip = request.ip ?? request.socket.remoteAddress ?? "unknown";
      this.logger.log(
        `${request.method} ${request.originalUrl} ${response.statusCode} ${durationMs}ms ip=${ip} ua="${userAgent}" requestId=${requestId}`
      );
    });

    next();
  }
}
