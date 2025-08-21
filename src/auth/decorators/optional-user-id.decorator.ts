import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export const OptionalUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();

    try {
      const authHeader = request.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        return undefined;
      }

      const token = authHeader.substring(7);

      // Создаем JwtService с вашими настройками
      const jwtService = new JwtService({
        secret: process.env.JWT_SECRET, // ваш секрет
      });

      const payload = jwtService.verify(token);
      return payload.sub || payload.id;
    } catch (error) {
      return undefined;
    }
  },
);
