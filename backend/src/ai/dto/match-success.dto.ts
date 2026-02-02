import { IsNumber, IsString, Max, Min } from "class-validator";

export class MatchSuccessDto {
  @IsString()
  teammateId!: string;

  @IsString()
  gameId!: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  successScore!: number;
}
