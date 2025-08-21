import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { PostCreateDto } from './dto/create-post.dto';
import { PostUpdateDto } from './dto/update-post.dto';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { Authorization } from 'src/auth/decorators/auth.decorator';
import { UserId } from 'src/auth/decorators/user-id.decorator';
import { ParseTagsPipe } from 'common/pipes/transform-tag.pipe';
import { Request } from 'express';
import { OptionalUserId } from 'src/auth/decorators/optional-user-id.decorator';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}
  @Get()
  @ApiOperation({ summary: 'Получить все посты' })
  findAll(@OptionalUserId() userId?: string) {
    return this.postService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пост по id' })
  findById(@Param('id') id: string, @OptionalUserId() userId?: string) {
    return this.postService.findById(id, userId);
  }

  @Post()
  @Authorization()
  @ApiOperation({ summary: 'Создать пост' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiBody({ type: PostCreateDto })
  create(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: PostCreateDto,
    @Body('tags', ParseTagsPipe) tags: string[],
    @UserId() userId: string,
  ) {
    return this.postService.create(dto, userId, tags);
  }

  @Patch(':id')
  @Authorization()
  @ApiOperation({ summary: 'Обновить пост' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiBody({ type: PostUpdateDto })
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: PostUpdateDto,
    @Body('tags', ParseTagsPipe) tags: string[],
    @UserId() userId: string,
  ) {
    return this.postService.update(id, dto, tags, userId);
  }

  @Delete(':id')
  @Authorization()
  @ApiOperation({ summary: 'Удалить пост' })
  remove(@Param('id') id: string, @UserId() userId: string) {
    return this.postService.remove(id, userId);
  }

  @Get('get-post-protected/:id')
  @Authorization()
  async getPostByIdProtected(
    @Param('id') id: string,
    @UserId() userId: string,
  ) {
    return this.postService.getPostByIdProtected(id, userId);
  }

  @Post(':id/like')
  @Authorization()
  async toggleLike(@Param('id') postId: string, @UserId() userId: string) {
    return this.postService.toggleLike(userId, postId);
  }

  @Post(':id/view')
  async addView(
    @Param('id') postId: string,
    @Req() req: Request,
    @UserId() userId?: string,
  ) {
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      'unknown';
    return this.postService.addView(postId, ip, userId);
  }
}
1;
