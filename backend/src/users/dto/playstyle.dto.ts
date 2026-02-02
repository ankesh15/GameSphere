import { IsArray, IsOptional, IsString } from "class-validator";

export class PlaystyleDto {
  @IsOptional()
  @IsString()
  competitiveStyle?: string;

  @IsOptional()
  @IsString()
  communicationStyle?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredRoles?: string[];
}
