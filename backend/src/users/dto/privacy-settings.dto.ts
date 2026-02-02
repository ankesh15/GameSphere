import { IsBoolean, IsOptional } from "class-validator";

export class PrivacySettingsDto {
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  showOnlineStatus?: boolean;

  @IsOptional()
  @IsBoolean()
  showMatchHistory?: boolean;
}
