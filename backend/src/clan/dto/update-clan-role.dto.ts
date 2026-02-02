import { IsIn, IsString, MinLength } from "class-validator";

const roles = ["admin", "moderator", "member"] as const;

export class UpdateClanRoleDto {
  @IsString()
  @MinLength(3)
  userId!: string;

  @IsIn(roles)
  role!: (typeof roles)[number];
}
