import { IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { AvailabilitySlotDto } from "./availability-slot.dto";

export class UpdateAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  availability!: AvailabilitySlotDto[];
}
