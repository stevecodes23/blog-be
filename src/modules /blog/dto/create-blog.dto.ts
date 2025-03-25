import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBlog {
  @IsNotEmpty()
  @IsString()
  title: string;
  @IsNotEmpty()
  @IsString()
  description: string;
  @IsNotEmpty()
  @IsString()
  blogContent: string;
}
