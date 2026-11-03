import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CoursesService } from '../courses/courses.service';
import { UsersService } from '../users/users.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate, PaginatedResult } from '../common/utils/paginate.util';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    private readonly coursesService: CoursesService,
    private readonly usersService: UsersService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  async create(dto: CreateReviewDto, userUuid: string): Promise<Review> {
    const student = await this.usersService.findOne(userUuid);
    const course = await this.coursesService.findOne(dto.courseUuid);

    // Verify the student is enrolled (Verified Review constraint)
    const isEnrolled = await this.enrollmentsService.isStudentEnrolled(
      (student as any)._id,
      (course as any)._id,
    );

    if (!isEnrolled) {
      throw new ForbiddenException(
        'Only enrolled students can review this course',
      );
    }

    // Check if the student already left a review
    const existing = await this.reviewModel.findOne({
      student: (student as any)._id,
      course: (course as any)._id,
    });

    if (existing) {
      throw new ConflictException(
        'You have already submitted a review for this course. Please update your existing review.',
      );
    }

    const createdReview = await this.reviewModel.create({
      student: (student as any)._id,
      course: (course as any)._id,
      rating: dto.rating,
      comment: dto.comment,
    });

    return await this.findOne(createdReview.uuid);
  }

  async findByCourse(courseUuid: string, paginationDto?: PaginationDto): Promise<PaginatedResult<Review>> {
    const course = await this.coursesService.findOne(courseUuid);

    return await paginate<Review>(
      this.reviewModel,
      { course: (course as any)._id },
      paginationDto,
      {
        populate: { path: 'student', select: 'uuid name' },
        sort: { createdAt: -1 },
      },
    );
  }

  /**
   * MongoDB Native Aggregation Pipeline:
   * Computes course average rating, total review count, and star distribution
   */
  async getCourseStats(courseUuid: string) {
    const course = await this.coursesService.findOne(courseUuid);

    const stats = await this.reviewModel.aggregate([
      { $match: { course: (course as any)._id } },
      {
        $group: {
          _id: '$course',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    if (!stats || stats.length === 0) {
      return {
        courseUuid: course.uuid,
        averageRating: 0,
        totalReviews: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const result = stats[0];
    return {
      courseUuid: course.uuid,
      averageRating: Math.round(result.averageRating * 10) / 10,
      totalReviews: result.totalReviews,
      breakdown: {
        5: result.fiveStars,
        4: result.fourStars,
        3: result.threeStars,
        2: result.twoStars,
        1: result.oneStar,
      },
    };
  }

  async findOne(uuid: string): Promise<Review> {
    const review = await this.reviewModel
      .findOne({ uuid })
      .populate({ path: 'student', select: 'uuid name' })
      .populate('course')
      .exec();

    if (!review) {
      throw new NotFoundException(`Review with UUID ${uuid} not found`);
    }

    return review;
  }

  async update(
    uuid: string,
    userUuid: string,
    dto: UpdateReviewDto,
    isAdmin: boolean,
  ): Promise<Review> {
    const review = await this.findOne(uuid);

    if ((review.student as any).uuid !== userUuid && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to modify this review',
      );
    }

    const updated = await this.reviewModel
      .findOneAndUpdate({ uuid }, { $set: dto }, { new: true })
      .populate({ path: 'student', select: 'uuid name' })
      .populate('course')
      .exec();

    return updated!;
  }

  async delete(
    uuid: string,
    userUuid: string,
    isAdmin: boolean,
  ): Promise<{ message: string }> {
    const review = await this.findOne(uuid);

    if ((review.student as any).uuid !== userUuid && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete this review',
      );
    }

    await this.reviewModel.deleteOne({ uuid }).exec();
    return { message: `Review with UUID ${uuid} has been deleted` };
  }
}
