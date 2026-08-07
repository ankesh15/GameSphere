import { BadRequestException, Logger, ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/http-exception.filter";
import { ErrorTrackingService } from "./common/monitoring/error-tracking.service";
import { SanitizationPipe } from "./common/pipes/sanitize.pipe";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── CORS ──────────────────────────────────────────────────────────────
  // Allow the Vite dev server (5173) and production origins.
  // credentials: true is required for cookies & Authorization headers.
  const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000"
  ];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      // Allow requests with no origin (e.g. mobile apps, Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        Logger.warn(`Blocked CORS request from origin: ${origin}`, "CORS");
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "x-request-id"
    ],
    exposedHeaders: ["x-request-id"]
  });

  // Global API prefix keeps routes versionable and consistent.
  app.setGlobalPrefix("api");

  // ── Pipes ─────────────────────────────────────────────────────────────
  // Order matters: sanitize first, then validate.
  // SanitizationPipe must mutate in-place (NOT reconstruct) to preserve
  // the prototype chain for class-validator.
  app.useGlobalPipes(
    new SanitizationPipe(),
    new ValidationPipe({
      whitelist: true,
      transform: true,
      enableDebugMessages: false,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true
      },
      // Return human-readable validation error messages
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((error) => {
          const constraints = error.constraints;
          if (constraints) {
            return Object.values(constraints);
          }
          return [`${error.property} has invalid value`];
        });


        return new BadRequestException({
          success: false,
          message: messages.length === 1 ? messages[0] : messages,
          error: "Validation failed"
        });
      }
    })
  );

  // ── Exception Filter ──────────────────────────────────────────────────
  const httpAdapterHost = app.get(HttpAdapterHost);
  const errorTrackingService = app.get(ErrorTrackingService);
  app.useGlobalFilters(
    new GlobalExceptionFilter(httpAdapterHost, errorTrackingService)
  );

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  Logger.log(`GameSphere API listening on port ${port}`);
}

bootstrap();
