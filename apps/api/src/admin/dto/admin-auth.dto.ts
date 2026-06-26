import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class AdminLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  captchaToken?: string;
}
