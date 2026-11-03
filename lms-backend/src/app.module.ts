import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesModule } from './courses/courses.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LessonsModule } from './lessons/lessons.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { ProgressModule } from './progress/progress.module';
import { ReviewsModule } from './reviews/reviews.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { UploadsModule } from './uploads/uploads.module';
import { RequestsModule } from './requests/requests.module';
import { AppEventsModule } from './common/events/app-events.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    AppEventsModule,
    NotificationsModule,
    CoursesModule,
    CategoriesModule,
    UsersModule,
    AuthModule,
    LessonsModule,
    EnrollmentsModule,
    ProgressModule,
    ReviewsModule,
    QuizzesModule,
    UploadsModule,
    RequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
