import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
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
import { UpdateBlog } from './dto/update-blog.dto';
import { CreateComment } from './dto/create-comment.dto';

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
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.USER)
  @Post('update/:id')
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
  async updateBlog(
    @Body() updateBlog: UpdateBlog,
    @Param('id', ParseIntPipe) blogId: number,
    @GetUser('id') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.standardResponse(
      await this.blogService.updateBlog(
        updateBlog,
        userId,
        blogId,
        file?.filename,
      ),
    );
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.USER)
  @Get('myblogs')
  async myBlogs(@GetUser('id') userId: number) {
    return this.standardResponse(await this.blogService.getMyblogs(userId));
  }
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.USER)
  @Get('deleteblog/:id')
  async deleteBlog(
    @Param('id', ParseIntPipe) blogId: number,
    @GetUser('id') userId: number,
  ) {
    return this.standardResponse(
      await this.blogService.deleteBlog(blogId, userId),
    );
  }
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.USER)
  @Get('/:id')
  async getindivisualBlog(@Param('id', ParseIntPipe) blogId: number) {
    return this.standardResponse(
      await this.blogService.getindivisualBlog(blogId),
    );
  }
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.USER)
  @Get('/blog-lisitng')
  async getBlogs() {
    return this.standardResponse(await this.blogService.getBlogs());
  }
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.USER)
  @Post('/comments/:id')
  async addcomments(
    @Param('id', ParseIntPipe) blogId: number,
    @Body() createComment: CreateComment,
    @GetUser('id') userId: number,
  ) {
    return this.standardResponse(
      await this.blogService.addcomments(createComment, blogId, userId),
    );
  }
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.USER)
  @Post('/reply-comments/:id')
  async replyToComments(
    @Param('id', ParseIntPipe) commentId: number,
    @Body() createComment: CreateComment,
    @GetUser('id') userId: number,
  ) {
    return this.standardResponse(
      await this.blogService.replyToComments(createComment, commentId, userId),
    );
  }
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.USER)
  @Delete('/reply-comments/:id')
  async deleteReply(
    @Param('id', ParseIntPipe) commentId: number,
    @GetUser('id') userId: number,
  ) {
    return this.standardResponse(
      await this.blogService.deleteReply(commentId, userId),
    );
  }
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.USER)
  @Delete('/comments/:id')
  async deleteComment(
    @Param('id', ParseIntPipe) commentId: number,
    @Body() createComment: CreateComment,
    @GetUser('id') userId: number,
  ) {
    return this.standardResponse(
      await this.blogService.deleteComment(commentId, userId),
    );
  }
}
