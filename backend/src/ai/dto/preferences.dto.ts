import { IsArray, IsOptional, IsString } from "class-validator";

export class PreferencesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  playstyle?: string[];

  @IsOptional()
  @IsString()
  freeText?: string;

  @IsOptional()
  @IsString()
  region?: string;
}
