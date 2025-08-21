import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PostService } from 'src/post/post.service';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postService: PostService,
  ) {}

  async create(dto: CreateCommentDto, userId: string, postId: string) {
    const existingPost = await this.postService.findById(postId);

    if (!existingPost) {
      throw new Error(`Post with id ${postId} not found`);
    }

    const { text } = dto;

    const comment = await this.prisma.comment.create({
      data: {
        text,
        postId,
        userId,
      },
    });

    return comment;
  }

  async update(dto: UpdateCommentDto, userId: string, commentId) {
    const { text } = dto;

    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.userId !== userId) {
      throw new ConflictException(
        'Комментарий не найден или нет прав на изменение',
      );
    }

    return await this.prisma.comment.update({
      where: {
        id: commentId,
      },

      data: {
        text,
      },
    });
  }

  async remove(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment || comment.userId !== userId) {
      throw new ConflictException(
        'Комментарий не найден или нет прав на изменение',
      );
    }

    return await this.prisma.comment.delete({
      where: {
        id: commentId,
      },
    });
  }
}
