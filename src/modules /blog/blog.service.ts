import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { CreateBlog } from './dto/create-blog.dto';
import { ENV } from 'src/constants/env.constant';
import { UpdateBlog } from './dto/update-blog.dto';

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
  async updateBlog(
    updateBlog: UpdateBlog,
    userId: number,
    blogId: number,
    imageName?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    const blog = await this.prisma.blog.findFirst({
      where: {
        id: blogId,
      },
    });
    if (!blog) {
      throw new HttpException('Blog not found', 404);
    }
    if (blog.createdById !== userId) {
      throw new HttpException('Unauthorized to update this blog', 401);
    }
    const updatedblog = await this.prisma.blog.update({
      where: {
        id: blogId,
      },
      data: {
        title: updateBlog.title,
        description: updateBlog.description,
        imageUrl: imageName ?? null,
        createdById: userId,
      },
      select: {
        title: true,
        description: true,
      },
    });
    return {
      ...updatedblog,
      imageUrl: imageName ? ENV.URL.BASE_URL_BLOG + imageName : null,
    };
  }
  async getMyblogs(userId) {
    const blogs = await this.prisma.blog.findMany({
      where: {
        createdById: userId,
      },
      select: {
        title: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (blogs.length > 0) {
      blogs.map((blogs) => {
        blogs.imageUrl = ENV.URL.BASE_URL_BLOG + blogs.imageUrl;
        return blogs;
      });
    }
    blogs.map((blogs) => {
      blogs.imageUrl = ENV.URL.BASE_URL_BLOG + blogs.imageUrl;
      return blogs;
    });
    return blogs;
  }
  async deleteBlog(blogId: number, userId: number) {
    const blog = await this.prisma.blog.findFirst({
      where: {
        id: blogId,
      },
    });
    if (!blog) {
      throw new HttpException('Blog not found', 404);
    }
    if (blog.createdById !== userId) {
      throw new HttpException('Unauthorized to delete this blog', 401);
    }
    await this.prisma.blog.update({
      where: {
        id: blogId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return { message: 'Blog deleted successfully' };
  }
}
