import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../auth/types/auth-user";
import { AiService } from "./ai.service";
import { RecommendDto } from "./dto/recommend.dto";

@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("recommend")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  recommend(@CurrentUser() user: AuthUser, @Body() payload: RecommendDto) {
    return this.aiService.recommend(user.sub, payload);
  }
}
