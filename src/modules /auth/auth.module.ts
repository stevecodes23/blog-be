import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/services/prisma.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from 'src/gaurds/authentication.gaurd';
import { RolesGuard } from 'src/gaurds/roles.gaurd';
import { ENV } from 'src/constants/env.constant';

@Module({
  imports: [
    JwtModule.register({
      secret: ENV.JWT.SECRET,
      signOptions: { expiresIn: ENV.JWT.EXPIRY },
    }),
  ],
  providers: [
    AuthService,
    PrismaService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
