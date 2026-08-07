import { Injectable, Logger, PipeTransform } from "@nestjs/common";
import xss from "xss";

/**
 * Sanitize all incoming string values using xss() to prevent XSS attacks.
 *
 * IMPORTANT: This pipe mutates string properties in-place rather than
 * reconstructing the object. Reconstructing via Object.entries().reduce()
 * would strip the class prototype chain and break class-validator decorators
 * when the ValidationPipe runs afterwards with `transform: true`.
 */
@Injectable()
export class SanitizationPipe implements PipeTransform {
  private readonly logger = new Logger(SanitizationPipe.name);

  transform(value: unknown) {
    return this.sanitize(value);
  }

  private sanitize(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }

    if (typeof value === "object") {
      // Mutate in-place to preserve the object's prototype chain.
      // This is critical so that class-validator decorators remain intact
      // when the ValidationPipe transforms the object into a DTO class instance.
      const obj = value as Record<string, unknown>;
      for (const key of Object.keys(obj)) {
        obj[key] = this.sanitize(obj[key]);
      }
      return obj;
    }

    if (typeof value === "string") {
      const cleaned = xss(value, {
        whiteList: {},
        stripIgnoreTag: true,
        stripIgnoreTagBody: ["script"]
      });
      return cleaned.trim();
    }

    return value;
  }
}
