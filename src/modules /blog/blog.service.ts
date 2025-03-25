import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { CreateBlog } from './dto/create-blog.dto';
import { ENV } from 'src/constants/env.constant';
import { UpdateBlog } from './dto/update-blog.dto';
import { CreateComment } from './dto/create-comment.dto';

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
  async getindivisualBlog(blogId: number) {
    const blog = await this.prisma.blog.findFirst({
      where: {
        id: blogId,
      },
      select: {
        title: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
        comments: {
          select: {
            content: true,
            createdAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
              },
            },
            replies: {
              select: {
                content: true,
                createdAt: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    profileImage: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!blog) {
      throw new HttpException('Blog not found', 404);
    }
    blog.imageUrl = ENV.URL.BASE_URL_BLOG + blog.imageUrl;
    blog.author.profileImage = ENV.URL.BASE_URL + blog.author.profileImage;
    blog.comments = blog.comments.map((comment) => {
      comment.user.profileImage = ENV.URL.BASE_URL + comment.user.profileImage;

      comment.replies = comment.replies.map((reply) => {
        reply.user.profileImage = ENV.URL.BASE_URL + reply.user.profileImage;
        return reply;
      });

      return comment;
    });
    return blog;
  }
  async getBlogs() {
    const blogs = await this.prisma.blog.findMany({
      select: {
        title: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    blogs.map((blogs) => {
      blogs.imageUrl = ENV.URL.BASE_URL_BLOG + blogs.imageUrl;
      blogs.author.profileImage = ENV.URL.BASE_URL + blogs.author.profileImage;
      return blogs;
    });
    return blogs;
  }
  async addcomments(
    createComment: CreateComment,
    blogId: number,
    userId: number,
  ) {
    const blog = await this.prisma.blog.findFirst({
      where: {
        id: blogId,
      },
    });
    if (!blog) {
      throw new HttpException('Blog not found', 404);
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    const comment = await this.prisma.comment.create({
      data: {
        content: createComment.content,
        blogId: blogId,
        commentedById: userId,
      },
    });
    return {
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    };
  }
  async replyToComments(
    createComment: CreateComment,
    commentId: number,
    userId: number,
  ) {
    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
      },
    });
    if (!comment) {
      throw new HttpException('Comment not found', 404);
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    const reply = await this.prisma.reply.create({
      data: {
        content: createComment.content,
        commentId: commentId,
        replyiedById: userId,
      },
    });
    return {
      content: reply.content,
      createdAt: reply.createdAt,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    };
  }
}
