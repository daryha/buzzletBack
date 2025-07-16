import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { jwtPayload } from './interfaces/jwt.interface';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_TTL: string;
  private readonly JWT_REFRESH_TOKEN_TTL: string;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {
    this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_TTL',
    );
  }

  async register(res: Response, dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return this.auth(res, user.id);
  }

  async login(res: Response, dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.userService.findByEmail(email);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new NotFoundException('Неверная почта или пароль');
    }

    return this.auth(res, user.id);
  }

  async refresh(req: Request, res: Response) {
    const refToken = req.cookies['refreshToken'];

    if (!refToken) {
      throw new UnauthorizedException('Недействительный - refresh token');
    }

    const payload: jwtPayload = await this.jwtService.verifyAsync(refToken);
    if (payload) {
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.id,
        },

        select: {
          id: true,
        },
      });

      if (!user) {
        throw new NotFoundException('Пользоватлеь не найден');
      }

      return this.auth(res, user.id);
    }
  }

  async logout(res: Response) {
    this.setCookie(res, 'refreshToken', new Date(0));

    return { message: 'success logout' };
  }

  async validate(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  private auth(res: Response, id: string) {
    const { accessToken, refreshToken } = this.generateToken(id);

    this.setCookie(
      res,
      refreshToken,
      new Date(Date.now() + 1000 + 60 * 60 * 24 * 7),
    );

    return { accessToken };
  }

  private generateToken(id: string) {
    const payload: jwtPayload = {
      id,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_TTL,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_TTL,
    });

    return { accessToken, refreshToken };
  }

  private setCookie(res: Response, value: string, expires: Date) {
    res.cookie('refreshToken', value, { httpOnly: true, expires });
  }
}
