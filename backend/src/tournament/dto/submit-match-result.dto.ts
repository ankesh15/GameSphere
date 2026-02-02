import { IsArray, IsInt, IsString, Min, MinLength } from "class-validator";

export class SubmitMatchResultDto {
  @IsString()
  @MinLength(4)
  matchId!: string;

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  scores!: number[];

  @IsString()
  @MinLength(3)
  winnerId!: string;
}
