import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const uploadPath = join(process.cwd(), 'uploads');
  console.log('>> STATIC DIR:', uploadPath);

  app.useStaticAssets(uploadPath, {
    prefix: '/avatars',
  });

  const config = new DocumentBuilder()
    .setTitle('Buzzlet')
    .setDescription('Buzzlet API')
    .setVersion('1.0.0')
    .setContact('Dauren Dev', 'https:/dauren.com', 'support@Dauren.com')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/docs', app, document, {
    customSiteTitle: 'API BUZZLET APP',
  });

  await app.listen(5000);
}
bootstrap();
