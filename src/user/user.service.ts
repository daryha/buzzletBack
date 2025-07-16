import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { hashSync } from 'bcryptjs';
import { Request } from 'express';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const { name, email, password } = dto;

    const existUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existUser) {
      throw new ConflictException(
        'Пользоватлеь с таким Email уже зарегистрирован',
      );
    }

    const passwordHash = hashSync(password, 8);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
      },
    });

    return user;
  }

  async uploadAvatar(userid: string, file: Express.Multer.File, req: Request) {
    if (!file) throw new HttpException('No file', HttpStatus.BAD_REQUEST);
    const url = `${req.protocol}://${req.get('host')}/avatars/${file.filename}`;

    const user = await this.updateAvatar(userid, file.filename);

    return {
      id: user.id,
      email: user.email,
      avatarUrl: url,
    };
  }

  async updateAvatar(userId: string, filename: string) {
    const exists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!exists) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: filename },
    });
  }
}
