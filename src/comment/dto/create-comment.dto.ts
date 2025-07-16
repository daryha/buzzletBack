import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  text: string;
  @IsOptional()
  commentId?: string;
}
