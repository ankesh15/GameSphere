import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested
} from "class-validator";
import { Type } from "class-transformer";
import { AvailabilitySlotDto } from "./availability-slot.dto";
import { PlaystyleDto } from "./playstyle.dto";
import { PrivacySettingsDto } from "./privacy-settings.dto";

const skillLevels = ["beginner", "intermediate", "advanced", "pro"] as const;

export class CreateGamerProfileDto {
  @IsString()
  @MinLength(3)
  gamerTag!: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  skillRating?: number;

  @IsOptional()
  @IsIn(skillLevels)
  skillLevel?: (typeof skillLevels)[number];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteGames?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PlaystyleDto)
  playstyle?: PlaystyleDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  availability?: AvailabilitySlotDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PrivacySettingsDto)
  privacy?: PrivacySettingsDto;
}
