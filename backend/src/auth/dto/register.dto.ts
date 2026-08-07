import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: "Please provide a valid email address." })
  @IsNotEmpty({ message: "Email is required." })
  email!: string;

  @IsString({ message: "Username must be a string." })
  @MinLength(3, { message: "Username must be at least 3 characters." })
  @MaxLength(30, { message: "Username must be at most 30 characters." })
  @IsNotEmpty({ message: "Username is required." })
  username!: string;

  @IsString({ message: "Password must be a string." })
  @MinLength(8, { message: "Password must be at least 8 characters." })
  @IsNotEmpty({ message: "Password is required." })
  password!: string;
}
