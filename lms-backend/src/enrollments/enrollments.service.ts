import {
  ConflictException,
  ForbiddenException,
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
import { UserRole } from '../users/schemas/user.schema';
import {
  AppEventsService,
  AppEventType,
} from '../common/events/app-events.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate, PaginatedResult } from '../common/utils/paginate.util';

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

  async findAll(paginationDto?: PaginationDto): Promise<PaginatedResult<Enrollment>> {
    return await paginate<Enrollment>(this.enrollmentModel, {}, paginationDto, {
      populate: [
        { path: 'student', select: '-password' },
        { path: 'course' },
      ],
      sort: { createdAt: -1 },
    });
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

  async findMyEnrollments(userUuid: string, paginationDto?: PaginationDto): Promise<PaginatedResult<Enrollment>> {
    const student = await this.usersService.findOne(userUuid);

    return await paginate<Enrollment>(
      this.enrollmentModel,
      { student: (student as any)._id },
      paginationDto,
      {
        populate: 'course',
        sort: { createdAt: -1 },
      },
    );
  }

  maskEmail(email?: string): string {
    if (!email) return '';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const [name, domain] = parts;
    if (name.length <= 2) return `${name[0]}***@${domain}`;
    return `${name[0]}***${name[name.length - 1]}@${domain}`;
  }

  async findByCourse(
    courseUuid: string,
    paginationDto?: PaginationDto,
    currentUser?: { uuid: string; role: string },
  ): Promise<PaginatedResult<Enrollment>> {
    const course = await this.coursesService.findOne(courseUuid);

    // If caller is an instructor, verify ownership
    if (currentUser && currentUser.role === UserRole.INSTRUCTOR) {
      const isOwner =
        course.instructor && (course.instructor as any).uuid === currentUser.uuid;
      if (!isOwner) {
        throw new ForbiddenException('You can only view student rosters for your own courses');
      }
    }

    const paginated = await paginate<Enrollment>(
      this.enrollmentModel,
      { course: (course as any)._id },
      paginationDto,
      {
        populate: { path: 'student', select: '-password' },
        sort: { createdAt: -1 },
      },
    );

    // Mask sensitive details (emails) for non-admins
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      paginated.items = paginated.items.map((item: any) => {
        const itemObj = item.toObject ? item.toObject() : { ...item };
        if (itemObj.student && itemObj.student.email) {
          itemObj.student.email = this.maskEmail(itemObj.student.email);
        }
        return itemObj;
      });
    }

    return paginated;
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