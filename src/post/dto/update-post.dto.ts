import { PartialType } from '@nestjs/mapped-types';
import { PostCreateDto } from './create-post.dto';

export class PostUpdateDto extends PartialType(PostCreateDto) {}
