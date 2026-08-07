import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UseGuards
} from "@nestjs/common";
import { AuthService, AuthTokens } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "./types/auth-user";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() payload: RegisterDto): Promise<AuthTokens> {
    this.logger.log(`POST /auth/register — email=${payload.email}`);
    return this.authService.register(payload);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() payload: LoginDto): Promise<AuthTokens> {
    this.logger.log(`POST /auth/login — email=${payload.email}`);
    return this.authService.login(payload);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() payload: RefreshTokenDto): Promise<AuthTokens> {
    this.logger.log("POST /auth/refresh");
    return this.authService.refresh(payload);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: AuthUser) {
    this.logger.log(`POST /auth/logout — userId=${user.sub}`);
    await this.authService.logout(user.sub);
    return { success: true, message: "Logged out successfully." };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthUser) {
    this.logger.log(`GET /auth/me — userId=${user.sub}`);
    return this.authService.getMe(user.sub);
  }
}
