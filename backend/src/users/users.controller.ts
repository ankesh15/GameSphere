import { Controller, Get, UseGuards } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("health")
  getHealth() {
    return this.usersService.getHealth();
  }

  @Get("admin/health")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  getAdminHealth() {
    return this.usersService.getAdminHealth();
  }
}
