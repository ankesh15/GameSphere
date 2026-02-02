import { IsArray, IsOptional, IsString } from "class-validator";

export class GameCatalogDto {
  @IsString()
  gameId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modes?: string[];
}
