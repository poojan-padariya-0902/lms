import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Enrollment,
  EnrollmentDocument,
  EnrollmentStatus,
} from './schemas/enrollment.schema';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollment.dto';
import { CoursesService } from '../courses/courses.service';
import { UsersService } from '../users/users.service';
import {
  AppEventsService,
  AppEventType,
} from '../common/events/app-events.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
    private readonly coursesService: CoursesService,
    private readonly usersService: UsersService,
    private readonly eventsService: AppEventsService,
  ) {}

  async create(
    createEnrollmentDto: CreateEnrollmentDto,
    currentUserUuid: string,
  ): Promise<Enrollment> {
    const targetStudentUuid =
      createEnrollmentDto.studentUuid || currentUserUuid;

    const student = await this.usersService.findOne(targetStudentUuid);
    const course = await this.coursesService.findOne(
      createEnrollmentDto.courseUuid,
    );

    // Check if the student is already enrolled in this course
    const existing = await this.enrollmentModel.findOne({
      student: (student as any)._id,
      course: (course as any)._id,
    });

    if (existing) {
      throw new ConflictException(
        'Student is already enrolled in this course',
      );
    }

    const createdEnrollment = await this.enrollmentModel.create({
      student: (student as any)._id,
      course: (course as any)._id,
      enrolledAt: new Date(),
      status: EnrollmentStatus.ACTIVE,
    });

    // Asynchronously dispatch decoupled event for email notifications
    this.eventsService.emitEvent(AppEventType.ENROLLMENT_CREATED, {
      studentUuid: targetStudentUuid,
      courseTitle: course.title,
      enrolledAt: createdEnrollment.enrolledAt,
    });

    return await this.findOne(createdEnrollment.uuid);
  }

  async findAll(): Promise<Enrollment[]> {
    return await this.enrollmentModel
      .find()
      .populate({ path: 'student', select: '-password' })
      .populate('course')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(uuid: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentModel
      .findOne({ uuid })
      .populate({ path: 'student', select: '-password' })
      .populate('course')
      .exec();

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with UUID ${uuid} not found`);
    }

    return enrollment;
  }

  async findMyEnrollments(userUuid: string): Promise<Enrollment[]> {
    const student = await this.usersService.findOne(userUuid);

    return await this.enrollmentModel
      .find({ student: (student as any)._id })
      .populate('course')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByCourse(courseUuid: string): Promise<Enrollment[]> {
    const course = await this.coursesService.findOne(courseUuid);

    return await this.enrollmentModel
      .find({ course: (course as any)._id })
      .populate({ path: 'student', select: '-password' })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(
    uuid: string,
    updateDto: UpdateEnrollmentStatusDto,
  ): Promise<Enrollment> {
    const updated = await this.enrollmentModel
      .findOneAndUpdate({ uuid }, { status: updateDto.status }, { new: true })
      .populate({ path: 'student', select: '-password' })
      .populate('course')
      .exec();

    if (!updated) {
      throw new NotFoundException(`Enrollment with UUID ${uuid} not found`);
    }

    return updated;
  }

  async delete(uuid: string): Promise<{ message: string }> {
    const result = await this.enrollmentModel.deleteOne({ uuid }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Enrollment with UUID ${uuid} not found`);
    }

    return { message: `Enrollment with UUID ${uuid} has been deleted` };
  }

  async isStudentEnrolled(studentId: any, courseId: any): Promise<boolean> {
    const count = await this.enrollmentModel
      .countDocuments({
        student: studentId,
        course: courseId,
        status: EnrollmentStatus.ACTIVE,
      })
      .exec();

    return count > 0;
  }
}