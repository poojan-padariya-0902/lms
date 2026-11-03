import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChangeRequest,
  RequestDocument,
  RequestStatus,
  RequestType,
} from './schemas/request.schema';
import { CreateRequestDto } from './dto/create-request.dto';
import { ReviewRequestDto } from './dto/review-request.dto';
import { UsersService } from '../users/users.service';
import { CoursesService } from '../courses/courses.service';
import { CategoriesService } from '../categories/categories.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { ReviewsService } from '../reviews/reviews.service';
import { UserRole } from '../users/schemas/user.schema';
import { CourseStatus } from '../courses/schemas/course.schema';
import { EnrollmentStatus } from '../enrollments/schemas/enrollment.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate, PaginatedResult } from '../common/utils/paginate.util';

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(ChangeRequest.name)
    private readonly requestModel: Model<RequestDocument>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => CoursesService))
    private readonly coursesService: CoursesService,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
    @Inject(forwardRef(() => EnrollmentsService))
    private readonly enrollmentsService: EnrollmentsService,
    @Inject(forwardRef(() => ReviewsService))
    private readonly reviewsService: ReviewsService,
  ) {}

  async create(createDto: CreateRequestDto, userUuid: string): Promise<ChangeRequest> {
    const requester = await this.usersService.findOne(userUuid);

    // Generate readable tracking number
    const prefix = createDto.type === RequestType.BECOME_INSTRUCTOR ? 'APP' : 'REQ';
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const requestNumber = `${prefix}-${new Date().getFullYear()}-${randomDigits}`;

    // Side effect on request creation: if publishing course, set status to PENDING_APPROVAL
    if (createDto.type === RequestType.PUBLISH_COURSE && createDto.details?.courseUuid) {
      try {
        await this.coursesService.update(createDto.details.courseUuid, {
          status: CourseStatus.PENDING_APPROVAL as any,
        } as any);
      } catch {
        // Ignore if course update fails
      }
    }

    const created = await this.requestModel.create({
      requestNumber,
      type: createDto.type,
      status: RequestStatus.PENDING,
      requester: (requester as any)._id,
      reason: createDto.reason,
      details: createDto.details || {},
    });

    return await this.findOne(created.uuid);
  }

  async findOne(uuid: string): Promise<ChangeRequest> {
    const req = await this.requestModel
      .findOne({ uuid })
      .populate({ path: 'requester', select: 'uuid name email role' })
      .populate({ path: 'reviewedBy', select: 'uuid name email' })
      .exec();

    if (!req) {
      throw new NotFoundException(`Request with UUID ${uuid} not found`);
    }

    return req;
  }

  async findByRequestNumber(requestNumber: string): Promise<ChangeRequest> {
    const req = await this.requestModel
      .findOne({ requestNumber })
      .populate({ path: 'requester', select: 'uuid name email role' })
      .populate({ path: 'reviewedBy', select: 'uuid name email' })
      .exec();

    if (!req) {
      throw new NotFoundException(`Application with number ${requestNumber} not found`);
    }

    return req;
  }

  async findMyRequests(userUuid: string, paginationDto?: PaginationDto): Promise<PaginatedResult<ChangeRequest>> {
    const user = await this.usersService.findOne(userUuid);

    return await paginate<ChangeRequest>(
      this.requestModel,
      { requester: (user as any)._id },
      paginationDto,
      {
        populate: [
          { path: 'requester', select: 'uuid name email role' },
          { path: 'reviewedBy', select: 'uuid name email' },
        ],
        sort: { createdAt: -1 },
      },
    );
  }

  async findAll(
    type?: RequestType,
    status?: RequestStatus,
    paginationDto?: PaginationDto,
  ): Promise<PaginatedResult<ChangeRequest>> {
    const filter: Record<string, any> = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    return await paginate<ChangeRequest>(this.requestModel, filter, paginationDto, {
      populate: [
        { path: 'requester', select: 'uuid name email role' },
        { path: 'reviewedBy', select: 'uuid name email' },
      ],
      sort: { createdAt: -1 },
    });
  }

  async review(uuid: string, reviewDto: ReviewRequestDto, adminUserUuid: string): Promise<ChangeRequest> {
    const reqDoc = await this.requestModel.findOne({ uuid }).populate('requester').exec();
    if (!reqDoc) {
      throw new NotFoundException(`Request with UUID ${uuid} not found`);
    }

    if (reqDoc.status !== RequestStatus.PENDING) {
      throw new BadRequestException(`This request has already been ${reqDoc.status.toLowerCase()}`);
    }

    const admin = await this.usersService.findOne(adminUserUuid);

    reqDoc.status = reviewDto.status;
    reqDoc.adminFeedback = reviewDto.adminFeedback;
    reqDoc.reviewedBy = (admin as any)._id;
    reqDoc.reviewedAt = new Date();

    // Execute automatic side effects upon APPROVAL
    if (reviewDto.status === RequestStatus.APPROVED) {
      const details = reqDoc.details || {};

      switch (reqDoc.type) {
        case RequestType.BECOME_INSTRUCTOR: {
          const requesterUuid = (reqDoc.requester as any).uuid;
          if (requesterUuid) {
            await this.usersService.update(requesterUuid, { role: UserRole.INSTRUCTOR });
          }
          break;
        }

        case RequestType.PUBLISH_COURSE: {
          if (details.courseUuid) {
            await this.coursesService.update(details.courseUuid, {
              status: CourseStatus.PUBLISHED as any,
            } as any);
          }
          break;
        }

        case RequestType.DELETE_COURSE: {
          if (details.courseUuid) {
            await this.coursesService.delete(details.courseUuid);
          }
          break;
        }

        case RequestType.NEW_CATEGORY: {
          if (details.name) {
            await this.categoriesService.create({
              name: details.name,
              description: details.description || undefined,
            });
          }
          break;
        }

        case RequestType.REVOKE_STUDENT: {
          if (details.enrollmentUuid) {
            await this.enrollmentsService.updateStatus(details.enrollmentUuid, {
              status: EnrollmentStatus.CANCELLED,
            });
          }
          break;
        }

        case RequestType.FLAG_REVIEW: {
          if (details.reviewUuid) {
            await this.reviewsService.delete(details.reviewUuid, adminUserUuid, true);
          }
          break;
        }
      }
    } else if (reviewDto.status === RequestStatus.REJECTED) {
      // If course publish rejected, revert course back to DRAFT
      if (reqDoc.type === RequestType.PUBLISH_COURSE && reqDoc.details?.courseUuid) {
        try {
          await this.coursesService.update(reqDoc.details.courseUuid, {
            status: CourseStatus.DRAFT as any,
          } as any);
        } catch {
          // Ignore
        }
      }
    }

    await reqDoc.save();
    return await this.findOne(uuid);
  }
}
