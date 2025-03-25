import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { SignUpDto } from '../auth/dto/signup.dto';
import { generateHash } from 'src/utils/app.utils';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  async createuser(signUpDto: SignUpDto, filename: string){
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: signUpDto.email,
      },
    });
    if (existingUser) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await generateHash(signUpDto.password);
    const user = await this.prisma.user.create({
      data: {
        firstName: signUpDto.firstName,
        lastName: signUpDto.LastName,
        email: signUpDto.email,
        password: hashedPassword,
        role: Role.USER,
        profileImage: filename,
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    });
    return user;
  }
}
