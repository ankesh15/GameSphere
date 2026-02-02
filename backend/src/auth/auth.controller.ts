import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
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
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  register(@Body() payload: RegisterDto): Promise<AuthTokens> {
    return this.authService.register(payload);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() payload: LoginDto): Promise<AuthTokens> {
    return this.authService.login(payload);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  refresh(@Body() payload: RefreshTokenDto): Promise<AuthTokens> {
    return this.authService.refresh(payload);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser() user: AuthUser): Promise<void> {
    await this.authService.logout(user.sub);
  }
}
