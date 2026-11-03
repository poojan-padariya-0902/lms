import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Set global API route prefix
  app.setGlobalPrefix('api');

  // 2. Serve static uploaded files (course images, assets)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // 3. Enable global DTO validation & transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 4. Register global response interceptor & exception filter
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // 5. Configure Swagger (OpenAPI) documentation
  const config = new DocumentBuilder()
    .setTitle('LMS Backend API')
    .setDescription('Production-Grade LMS Backend API Documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication and user session management')
    .addTag('users', 'User profile and role administration')
    .addTag('courses', 'Course catalog and authoring')
    .addTag('categories', 'Course taxonomy and categories')
    .addTag('lessons', 'Hierarchical curriculum content and ordering')
    .addTag('enrollments', 'Student course enrollment and status tracking')
    .addTag('progress', 'Lesson completion and course progress tracking')
    .addTag('reviews', 'Course ratings, reviews, and aggregation stats')
    .addTag('quizzes', 'Assessments, questions, and auto-grading submissions')
    .addTag('uploads', 'Multipart media and file uploads')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
