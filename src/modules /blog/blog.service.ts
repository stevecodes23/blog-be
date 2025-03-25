import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { CreateBlog } from './dto/create-blog.dto';
import { ENV } from 'src/constants/env.constant';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}
  async createBlog(createBlog: CreateBlog, userId: number, imageName?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    const blog = await this.prisma.blog.create({
      data: {
        title: createBlog.title,
        description: createBlog.description,
        imageUrl: imageName ?? null,
        createdById: userId,
      },
      select: {
        title: true,
        description: true,
      },
    });
    return {
      ...blog,
      imageUrl: imageName ? ENV.URL.BASE_URL_BLOG + imageName : null,
    };
  }
}
