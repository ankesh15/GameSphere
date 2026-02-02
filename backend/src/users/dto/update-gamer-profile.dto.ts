import { PartialType } from "@nestjs/mapped-types";
import { CreateGamerProfileDto } from "./create-gamer-profile.dto";

export class UpdateGamerProfileDto extends PartialType(CreateGamerProfileDto) {}
