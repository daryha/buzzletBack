import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostCreateDto } from './dto/create-post.dto';
import { PostUpdateDto } from './dto/update-post.dto';
import { Post } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: string) {
    const posts = this.prisma.post.findMany({
      where: {
        published: true,
      },

      select: {
        id: true,
        title: true,
        description: true,
        bannerImg: true,
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            views: true,
          },
        },
        likes: userId
          ? {
              where: { userId },
              take: 1,
              select: { id: true },
            }
          : false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const result = await posts;

    return result.map((post) => {
      const { likes, ...postWithoutLikes } = post;
      return {
        ...postWithoutLikes,
        liked: likes?.length > 0,
      };
    });
  }

  async findById(id: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        text: true,
        bannerImg: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          select: {
            id: true,
            text: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            views: true,
            likes: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        likes: userId
          ? {
              where: { userId },
              take: 1,
              select: { id: true },
            }
          : false,
      },
    });

    if (post?.published === false) {
      throw new NotFoundException(`Пост с id = ${id} не найден`);
    }

    if (!post) {
      throw new NotFoundException(`Пост с id = ${id} не найден`);
    }

    const { likes, ...postWithoutLikes } = post;
    return {
      ...postWithoutLikes,
      ...post,
      liked: likes?.length > 0,
    };
  }

  async getPostByIdProtected(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        text: true,
        published: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Пост с id ${id} не найден`);
    }

    if (!post.published && post.author.id !== userId) {
      throw new ForbiddenException('У вас нет прав для просмотра этого поста');
    }

    return post;
  }

  async create(
    dto: PostCreateDto,
    userId: string,
    tags: string[],
  ): Promise<Post> {
    return this.prisma.post.create({
      data: {
        ...dto,
        authorId: userId,
        tags: {
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { tags: { select: { name: true } } },
    });
  }

  async update(
    id: string,
    dto: PostUpdateDto,
    tags: string[],
    userId: string,
  ): Promise<Post> {
    const post = await this.findById(id);

    if (!post || post.author.id !== userId) {
      throw new ConflictException('Не найден пост или нет прав на изменения');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        ...dto,
        tags: {
          set: [],
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { tags: { select: { name: true } } },
    });
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const post = await this.findById(id);

    if (!post || post.author.id !== userId) {
      throw new ConflictException('Не найден пост или нет прав на изменения');
    }

    await this.prisma.post.delete({ where: { id: post.id } });
    return { message: `Пост ${id} успешно удален!` };
  }

  async toggleLike(userId: string, postId: string) {
    const existing = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existing) {
      await this.prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      return { liked: false };
    }

    await this.prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    return { liked: true };
  }

  async addView(postId: string, ip: string, userId?: string) {
    try {
      await this.prisma.view.upsert({
        where: {
          postId_ip: {
            postId,
            ip,
          },
        },
        update: {},
        create: {
          postId,
          ip,
          ...(userId ? { userId } : {}),
        },
      });
    } catch (e) {
      console.error('Ошибка в addView:', e);
    }
  }
}
