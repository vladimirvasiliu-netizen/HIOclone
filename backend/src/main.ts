import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: true este necesar pentru verificarea semnaturii webhook-ului Glovo
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('frontendOrigin'),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Delivery Integration API')
    .setDescription('API pentru integrarea comenzilor Bolt Food si Glovo')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  const port = configService.get<number>('port') ?? 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Backend pornit pe http://localhost:${port} (docs: /docs)`);
}

bootstrap();
