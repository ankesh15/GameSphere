import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

const providers = ["steam", "riot", "epic"] as const;

export type GamingProvider = (typeof providers)[number];

export class LinkGamingAccountDto {
  @IsIn(providers)
  provider!: GamingProvider;

  @IsString()
  @MinLength(2)
  handle!: string;

  @IsOptional()
  @IsString()
  externalId?: string;
}
