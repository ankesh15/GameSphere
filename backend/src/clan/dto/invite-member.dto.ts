import { IsString, MinLength } from "class-validator";

export class InviteMemberDto {
  @IsString()
  @MinLength(3)
  userId!: string;
}
