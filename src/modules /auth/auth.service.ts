import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { SignUpDto } from '../auth/dto/signup.dto';
import { compareHash, generateHash } from 'src/utils/app.utils';
import { Role } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { ENV } from 'src/constants/env.constant';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async createuser(signUpDto: SignUpDto, filename: string) {
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
        lastName: signUpDto.lastName,
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
  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      const user = await this.prisma.user.findFirst({
        where: { email: email },
      });
      if (!user)
        throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
      const passwordValid = await compareHash(password, user.password);
      if (!passwordValid)
        throw new HttpException('Incorrect Password', HttpStatus.UNAUTHORIZED);
      const jwtPayload = {
        id: user.id,
        type: user.role,
      };
      const accessToken = await this.jwtService.signAsync(jwtPayload, {
        secret: ENV.JWT.SECRET,
        expiresIn: ENV.JWT.EXPIRY,
      });
      return { accessToken };
    } catch (error) {
      if (error.status)
        throw new HttpException(error.message, error.getStatus());
      else
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
}
