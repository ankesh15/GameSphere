import { IsArray, IsBoolean, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateClanDto {
  @IsString()
  @MinLength(3)
  @MaxLength(60)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(8)
  tag!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gameIds?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  recruiting?: boolean;
}
