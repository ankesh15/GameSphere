import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength
} from "class-validator";

export class CreateMatchRequestDto {
  @IsString()
  @MinLength(2)
  gameId!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  region?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  skill?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  pingMs?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  maxPingMs?: number;
}
