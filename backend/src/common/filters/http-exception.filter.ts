import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { Request } from "express";
import { ErrorTrackingService } from "../monitoring/error-tracking.service";

type ErrorResponseBody = {
  message?: string | string[];
  success?: boolean;
  error?: string;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly errorTrackingService?: ErrorTrackingService
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = exception instanceof HttpException
      ? (exception.getResponse() as ErrorResponseBody | string)
      : null;

    const message = this.extractMessage(responseBody, exception);

    // ── Detailed logging ────────────────────────────────────────────────
    const method = request?.method ?? "UNKNOWN";
    const url = request?.url ?? "";

    if (status >= 500) {
      this.logger.error(
        `Unhandled error on ${method} ${url}`,
        exception instanceof Error ? exception.stack : undefined
      );
      this.errorTrackingService?.trackError(exception, {
        path: url,
        method,
        status,
        requestId: request?.header?.("x-request-id")
      });
    } else {
      // Log 4xx with request details for debugging auth issues
      this.logger.warn(
        `${method} ${url} → ${status}: ${message ?? "Unknown error"}`
      );

      // Log request body for auth endpoints to aid debugging (exclude password)
      if (url.includes("/auth/") && request?.body) {
        const safeBody = { ...request.body };
        if (safeBody.password) {
          safeBody.password = "[REDACTED]";
        }
        this.logger.debug(
          `Auth request body: ${JSON.stringify(safeBody)}`
        );
      }
    }

    // ── Always return structured error with success: false ───────────────
    const payload = {
      success: false,
      statusCode: status,
      message: message ?? "Unexpected error.",
      path: url,
      timestamp: new Date().toISOString()
    };

    httpAdapter.reply(ctx.getResponse(), payload, status);
  }

  private extractMessage(
    responseBody: ErrorResponseBody | string | null,
    exception: unknown
  ): string | null {
    if (typeof responseBody === "string") {
      return responseBody;
    }

    if (responseBody?.message) {
      return Array.isArray(responseBody.message)
        ? responseBody.message.join(", ")
        : responseBody.message;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return null;
  }
}
