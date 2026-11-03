import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { ChangeRequest, RequestSchema } from './schemas/request.schema';
import { UsersModule } from '../users/users.module';
import { CoursesModule } from '../courses/courses.module';
import { CategoriesModule } from '../categories/categories.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ChangeRequest.name, schema: RequestSchema }]),
    UsersModule,
    forwardRef(() => CoursesModule),
    forwardRef(() => CategoriesModule),
    forwardRef(() => EnrollmentsModule),
    forwardRef(() => ReviewsModule),
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}

