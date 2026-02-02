import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  UseGuards
} from "@nestjs/common";
import { MatchmakingService } from "./matchmaking.service";
import { MatchRequestResponse } from "./matchmaking.types";
import { CreateMatchRequestDto } from "./dto/create-match-request.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../auth/types/auth-user";

@Controller("matchmaking")
export class MatchmakingController {
  private readonly logger = new Logger(MatchmakingController.name);

  constructor(private readonly matchmakingService: MatchmakingService) {}

  @Post("requests")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createRequest(
    @CurrentUser() user: AuthUser,
    @Body() payload: CreateMatchRequestDto
  ): Promise<MatchRequestResponse> {
    try {
      return await this.matchmakingService.createRequest({
        userId: user.sub,
        ...payload
      });
    } catch (error) {
      this.logger.error(
        "Failed to create matchmaking request",
        error instanceof Error ? error.stack : undefined
      );
      throw new InternalServerErrorException(
        "Unable to queue matchmaking request."
      );
    }
  }

  @Post("sessions/:sessionId/accept")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  acceptMatch(
    @CurrentUser() user: AuthUser,
    @Param("sessionId") sessionId: string
  ) {
    return this.matchmakingService.acceptMatch(sessionId, user.sub);
  }

  @Post("sessions/:sessionId/decline")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  declineMatch(
    @CurrentUser() user: AuthUser,
    @Param("sessionId") sessionId: string
  ) {
    return this.matchmakingService.declineMatch(sessionId, user.sub);
  }
}
