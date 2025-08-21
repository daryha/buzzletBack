import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PostService } from 'src/post/post.service';

@Module({
  controllers: [CommentController],
  providers: [CommentService, PostService],
})
export class CommentModule {}
