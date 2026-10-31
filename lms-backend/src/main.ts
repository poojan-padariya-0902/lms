import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Set global API route prefix
  app.setGlobalPrefix('api');

  // 2. Enable global DTO validation & transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 3. Configure Swagger (OpenAPI) documentation
  const config = new DocumentBuilder()
    .setTitle('LMS Backend API')
    .setDescription('LMS Backend API Documentation')
    .setVersion('1.0')
    .addTag('courses')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();