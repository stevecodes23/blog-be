import {
  ValidationOptions,
  IsNotEmpty,
  IsString,
  IsEmail,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty({
    message: 'First Name should not be empty',
  } as ValidationOptions)
  firstName: string;
  @IsString()
  @IsNotEmpty({
    message: 'First Name should not be empty',
  } as ValidationOptions)
  LastName: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
