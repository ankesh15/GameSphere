import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class GetChatMessagesDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  before?: string;
}
