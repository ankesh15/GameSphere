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

    if (status >= 500) {
      this.logger.error(
        `Unhandled error on ${request?.method ?? "UNKNOWN"} ${request?.url ?? ""}`,
        exception instanceof Error ? exception.stack : undefined
      );
      this.errorTrackingService?.trackError(exception, {
        path: request?.url,
        method: request?.method,
        status,
        requestId: request?.header?.("x-request-id")
      });
    } else {
      this.logger.warn(
        `Request failed with status ${status}: ${message ?? "Unknown error"}`
      );
    }

    const payload = {
      statusCode: status,
      path: request?.url ?? "",
      timestamp: new Date().toISOString(),
      message: message ?? "Unexpected error."
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
