import { IsDateString, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreateTournamentDto {
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(40)
  slug!: string;

  @IsString()
  @MinLength(2)
  gameId!: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(1024)
  maxParticipants?: number;

  @IsOptional()
  @IsDateString()
  startAt?: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  prizePool?: number;
}
