import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  previousPassword: string;

  @IsString()
  @IsNotEmpty()
  currentPassword: string;
}
