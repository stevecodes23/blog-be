import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBlog {
  @IsNotEmpty()
  @IsString()
  title: string;
  @IsNotEmpty()
  @IsString()
  description: string;
}
