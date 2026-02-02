import { IsString, MinLength } from "class-validator";

export class KickMemberDto {
  @IsString()
  @MinLength(3)
  userId!: string;
}
