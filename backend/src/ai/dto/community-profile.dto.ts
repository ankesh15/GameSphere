import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { GameHistoryDto } from "./game-history.dto";
import { PreferencesDto } from "./preferences.dto";

export class CommunityProfileDto {
  @IsString()
  userId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameHistoryDto)
  history!: GameHistoryDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences?: PreferencesDto;
}
