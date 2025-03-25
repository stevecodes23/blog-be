import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BaseController } from 'core/base.controller';
import { BlogService } from './blog.service';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateBlog } from './dto/create-blog.dto';
import { GetUser } from 'src/decorator/get-user.decorator';

@Controller('blog')
export class BlogController extends BaseController {
  constructor(private blogService: BlogService) {
    super();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.USER)
  @Post('create')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './public/uploads/blog-images',
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
  @ApiOperation({ summary: 'Blog with Image ' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Blog writing with image',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'abc' },
        description: { type: 'string', example: 'abc' },
        profileImage: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async createBlog(
    @Body() createBlog: CreateBlog,
    @GetUser('id') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.standardResponse(
      await this.blogService.createBlog(createBlog, userId, file?.filename),
    );
  }
}
