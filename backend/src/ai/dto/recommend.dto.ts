import { IsArray, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CommunityProfileDto } from "./community-profile.dto";
import { GameCatalogDto } from "./game-catalog.dto";
import { GameHistoryDto } from "./game-history.dto";
import { MatchSuccessDto } from "./match-success.dto";
import { PreferencesDto } from "./preferences.dto";

export class RecommendDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameHistoryDto)
  userHistory!: GameHistoryDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences?: PreferencesDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchSuccessDto)
  matchSuccess?: MatchSuccessDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommunityProfileDto)
  communityProfiles?: CommunityProfileDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameCatalogDto)
  gamesCatalog?: GameCatalogDto[];
}
