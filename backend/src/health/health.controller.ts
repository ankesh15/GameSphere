import { Controller, Get } from "@nestjs/common";

type HealthStatus = {
  status: "ok";
  timestamp: string;
};

@Controller("health")
export class HealthController {
  @Get()
  getHealth(): HealthStatus {
    return {
      status: "ok",
      timestamp: new Date().toISOString()
    };
  }
}
