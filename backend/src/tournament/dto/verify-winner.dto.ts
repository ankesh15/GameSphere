import { IsString, MinLength } from "class-validator";

export class VerifyWinnerDto {
  @IsString()
  @MinLength(4)
  matchId!: string;

  @IsString()
  @MinLength(3)
  winnerId!: string;
}
