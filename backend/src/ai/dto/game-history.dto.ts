import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class GameHistoryDto {
  @IsString()
  gameId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hoursPlayed?: number;

  @IsOptional()
  @IsBoolean()
  liked?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
