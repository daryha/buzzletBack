import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Authorization } from 'src/auth/decorators/auth.decorator';
import { UserId } from 'src/auth/decorators/user-id.decorator';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':id')
  @Authorization()
  async create(
    @Param('id') postId: string,
    @Body() dto: CreateCommentDto,
    @UserId() userId: string,
  ) {
    return this.commentService.create(dto, userId, postId);
  }

  @Patch(':id')
  @Authorization()
  async update(
    @Param('id') commentId: string,
    @Body() dto: UpdateCommentDto,
    @UserId() userId: string,
  ) {
    return this.commentService.update(dto, userId, commentId);
  }

  @Delete(':id')
  @Authorization()
  async delete(@Param('id') commentId: string, @UserId() userId: string) {
    return this.commentService.remove(commentId, userId);
  }
}
