import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Progress, ProgressDocument } from './schemas/progress.schema';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { LessonsService } from '../lessons/lessons.service';
import { CoursesService } from '../courses/courses.service';
import { UsersService } from '../users/users.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress.name)
    private readonly progressModel: Model<ProgressDocument>,
    private readonly lessonsService: LessonsService,
    private readonly coursesService: CoursesService,
    private readonly usersService: UsersService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  async updateLessonProgress(
    lessonUuid: string,
    userUuid: string,
    updateDto: UpdateProgressDto,
  ): Promise<Progress> {
    const student = await this.usersService.findOne(userUuid);
    const lesson = await this.lessonsService.findOne(lessonUuid);

    const courseId = (lesson.course as any)._id;

    // Verify student is enrolled in the course
    const isEnrolled = await this.enrollmentsService.isStudentEnrolled(
      (student as any)._id,
      courseId,
    );

    if (!isEnrolled) {
      throw new ForbiddenException(
        'You must be enrolled in this course to track lesson progress',
      );
    }

    const isCompleted =
      updateDto.isCompleted !== undefined ? updateDto.isCompleted : true;

    const progress = await this.progressModel
      .findOneAndUpdate(
        {
          student: (student as any)._id,
          lesson: (lesson as any)._id,
        },
        {
          student: (student as any)._id,
          lesson: (lesson as any)._id,
          course: courseId,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .populate('lesson')
      .populate('course')
      .exec();

    return progress;
  }

  async getCourseProgress(courseUuid: string, userUuid: string) {
    const student = await this.usersService.findOne(userUuid);
    const course = await this.coursesService.findOne(courseUuid);

    // Verify student is enrolled in the course
    const isEnrolled = await this.enrollmentsService.isStudentEnrolled(
      (student as any)._id,
      (course as any)._id,
    );

    if (!isEnrolled) {
      throw new ForbiddenException(
        'You must be enrolled in this course to view progress',
      );
    }

    const totalLessons = await this.lessonsService.countByCourseId(
      (course as any)._id,
    );

    const completedLessons = await this.progressModel
      .countDocuments({
        student: (student as any)._id,
        course: (course as any)._id,
        isCompleted: true,
      })
      .exec();

    const percentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    const details = await this.progressModel
      .find({
        student: (student as any)._id,
        course: (course as any)._id,
      })
      .populate('lesson')
      .exec();

    return {
      courseUuid: course.uuid,
      courseTitle: course.title,
      totalLessons,
      completedLessons,
      percentage,
      isCompleted: percentage === 100,
      progress: details,
    };
  }

  async getMyProgress(userUuid: string): Promise<Progress[]> {
    const student = await this.usersService.findOne(userUuid);

    return await this.progressModel
      .find({ student: (student as any)._id })
      .populate('lesson')
      .populate('course')
      .exec();
  }
}