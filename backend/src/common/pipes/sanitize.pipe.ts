import { Injectable, PipeTransform } from "@nestjs/common";
import xss from "xss";

@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: unknown) {
    return this.sanitize(value);
  }

  private sanitize(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }

    if (value && typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>);
      return entries.reduce<Record<string, unknown>>((acc, [key, val]) => {
        acc[key] = this.sanitize(val);
        return acc;
      }, {});
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
