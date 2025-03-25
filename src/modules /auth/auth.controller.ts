import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SignUpDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { BaseController } from 'core/base.controller';
import { Public } from 'src/decorator/public.decorator';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController extends BaseController {
  constructor(private authService: AuthService) {
    super();
  }
  @Public()
  @Post('signup')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './public/uploads/profile-images',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new HttpException(
              'Only image files (JPG, JPEG, PNG) are allowed!',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'User Signup with Profile Image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'User Signup Form',
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'abc' },
        lastName: { type: 'string', example: 'abc' },
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'StrongPassword123' },
        profileImage: {
          type: 'string',
          format: 'binary', 
        },
      },
    },
  })
  async signup(
    @Body() signupDto: SignUpDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Profile image is required');
    }
    return await this.authService.createuser(signupDto, file.filename);
  }
  @Public()
  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
