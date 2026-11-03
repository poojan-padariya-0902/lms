import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

/**
 * Safely parses allowed CORS origins from environment variable.
 * Supports:
 * - Array: '["http://localhost:3000", "http://127.0.0.1:3000"]'
 * - Single/double quoted list: "['http://localhost:3000', 'http://127.0.0.1:3000']"
 * - Comma-separated string fallback: "http://localhost:3000,http://127.0.0.1:3000"
 */
function parseAllowedOrigins(raw?: string): string[] {
  const defaultOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  if (!raw) return defaultOrigins;

  const trimmed = raw.trim();

  // Handle array format e.g. ["http://localhost:3000", "http://127.0.0.1:3000"]
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => String(s).trim()).filter(Boolean);
      }
    } catch {
      // Loose array or single-quote strings fallback
      return trimmed
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["'`]|["'`]$/g, ''))
        .filter(Boolean);
    }
  }

  // Fallback for comma-separated string
  return trimmed
    .split(',')
    .map((s) => s.trim().replace(/^["'`]|["'`]$/g, ''))
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // Read allowed origins from .env array
  const rawOrigins = configService.get<string>('ALLOWED_ORIGINS');
  const allowedOrigins = parseAllowedOrigins(rawOrigins);

  logger.log(`Configured CORS Whitelist origins: ${JSON.stringify(allowedOrigins)}`);

  // Enable Cross-Origin Resource Sharing (CORS) with whitelist from .env
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman, SSR) or matching whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`Blocked request from disallowed CORS origin: ${origin}`);
        callback(null, false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With',
    credentials: true,
  });

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
