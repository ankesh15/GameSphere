import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../auth/types/auth-user";
import { TournamentService } from "./tournament.service";
import { CreateTournamentDto } from "./dto/create-tournament.dto";
import { SubmitMatchResultDto } from "./dto/submit-match-result.dto";
import { VerifyWinnerDto } from "./dto/verify-winner.dto";

@Controller("tournaments")
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Get("health")
  getHealth() {
    return this.tournamentService.getHealth();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createTournament(
    @CurrentUser() user: AuthUser,
    @Body() payload: CreateTournamentDto
  ) {
    return this.tournamentService.createTournament(user.sub, payload);
  }

  @Post(":tournamentId/join")
  @UseGuards(JwtAuthGuard)
  joinTournament(
    @CurrentUser() user: AuthUser,
    @Param("tournamentId") tournamentId: string
  ) {
    return this.tournamentService.joinTournament(tournamentId, user.sub);
  }

  @Post(":tournamentId/leave")
  @UseGuards(JwtAuthGuard)
  leaveTournament(
    @CurrentUser() user: AuthUser,
    @Param("tournamentId") tournamentId: string
  ) {
    return this.tournamentService.leaveTournament(tournamentId, user.sub);
  }

  @Post(":tournamentId/bracket")
  @UseGuards(JwtAuthGuard)
  generateBracket(
    @CurrentUser() user: AuthUser,
    @Param("tournamentId") tournamentId: string
  ) {
    return this.tournamentService.generateBracket(tournamentId, user.sub);
  }

  @Post(":tournamentId/results")
  @UseGuards(JwtAuthGuard)
  submitMatchResult(
    @CurrentUser() user: AuthUser,
    @Param("tournamentId") tournamentId: string,
    @Body() payload: SubmitMatchResultDto
  ) {
    return this.tournamentService.submitMatchResult(tournamentId, user.sub, payload);
  }

  @Post(":tournamentId/verify")
  @UseGuards(JwtAuthGuard)
  verifyWinner(
    @CurrentUser() user: AuthUser,
    @Param("tournamentId") tournamentId: string,
    @Body() payload: VerifyWinnerDto
  ) {
    return this.tournamentService.verifyWinner(tournamentId, user, payload);
  }
}
