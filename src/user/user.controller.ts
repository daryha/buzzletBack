import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation } from '@nestjs/swagger';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserId } from 'src/auth/decorators/user-id.decorator';
import { Authorization } from 'src/auth/decorators/auth.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Создать юзера' })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @ApiOperation({ summary: 'Найти юзера по почте' })
  @Get()
  async findByEmail(@Body('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @ApiOperation({ summary: 'Загрузить аватарку' })
  @Post('avatar')
  @Authorization()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, callback) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${unique}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowedExt = ['.jpg', '.jpeg', '.png'];
        const ext = extname(file.originalname).toLowerCase();
        console.log('🔍 Uploaded extension:', ext);
        if (!allowedExt.includes(ext)) {
          return cb(
            new HttpException(
              'Only .jpg/.jpeg/.png allowed',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(
    @UserId() userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }
    const avatarUrl = `${req.protocol}://${req.get('host')}/avatars/${file.filename}`;

    const user = await this.userService.updateAvatar(userId, avatarUrl);

    return {
      id: user.id,
      email: user.email,
      avatarUrl,
    };
  }
}
