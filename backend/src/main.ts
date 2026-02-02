import { Logger, ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/http-exception.filter";
import { ErrorTrackingService } from "./common/monitoring/error-tracking.service";
import { SanitizationPipe } from "./common/pipes/sanitize.pipe";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true
  });

  // Global API prefix keeps routes versionable and consistent.
  app.setGlobalPrefix("api");

  // Whitelist ensures only validated payloads reach handlers.
  app.useGlobalPipes(
    new SanitizationPipe(),
    new ValidationPipe({
      whitelist: true,
      transform: true,
      enableDebugMessages: false,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

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
