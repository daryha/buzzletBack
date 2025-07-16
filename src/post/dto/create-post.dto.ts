import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class PostCreateDto {
  @ApiProperty({ description: 'Заголовок поста' })
  @IsString()
  title: string;
  @ApiProperty({ description: 'Описание поста' })
  @IsString()
  description: string;
  @ApiProperty({ description: 'Контент поста' })
  @IsString()
  text: string;
  @ApiProperty({ description: 'Баннер поста' })
  @IsString()
  @IsOptional()
  @Expose()
  bannerImg?: string;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  published?: boolean;
  @IsOptional()
  tags?: string[];
}
