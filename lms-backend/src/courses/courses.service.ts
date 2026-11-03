import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument, CourseStatus } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CategoriesService } from '../categories/categories.service';
import { UsersService } from '../users/users.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate, PaginatedResult } from '../common/utils/paginate.util';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
    private readonly usersService: UsersService,
  ) {}

  async create(createCourseDto: CreateCourseDto, instructorUuid?: string): Promise<Course> {
    const category = await this.categoriesService.findOne(
      createCourseDto.categoryUuid,
    );

    let instructorId: any = undefined;
    if (instructorUuid) {
      try {
        const user = await this.usersService.findOne(instructorUuid);
        instructorId = (user as any)._id;
      } catch {
        // Fallback
      }
    }

    const { categoryUuid, ...courseData } = createCourseDto;
    const createdCourse = await this.courseModel.create({
      ...courseData,
      category: (category as any)._id,
      instructor: instructorId,
      status: CourseStatus.DRAFT,
    });

    return await this.findOne(createdCourse.uuid);
  }

  async findAll(paginationDto?: PaginationDto, filter: any = {}): Promise<PaginatedResult<Course>> {
    return await paginate<Course>(this.courseModel, filter, paginationDto, {
      populate: [
        { path: 'category' },
        { path: 'instructor', select: 'uuid name email role' },
      ],
      sort: { createdAt: -1 },
    });
  }

  async findMyCourses(instructorUuid: string, paginationDto?: PaginationDto): Promise<PaginatedResult<Course>> {
    const user = await this.usersService.findOne(instructorUuid);

    return await paginate<Course>(
      this.courseModel,
      { instructor: (user as any)._id },
      paginationDto,
      {
        populate: [
          { path: 'category' },
          { path: 'instructor', select: 'uuid name email role' },
        ],
        sort: { createdAt: -1 },
      },
    );
  }

  async findOne(uuid: string): Promise<Course> {
    const course = await this.courseModel
      .findOne({ uuid })
      .populate('category')
      .populate({ path: 'instructor', select: 'uuid name email role' })
      .exec();

    if (!course) {
      throw new NotFoundException(`Course with UUID ${uuid} not found`);
    }
    return course;
  }

  async update(
    uuid: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    const { categoryUuid, ...updateData } = updateCourseDto;
    const updatePayload: any = { ...updateData };

    if (categoryUuid) {
      const category = await this.categoriesService.findOne(categoryUuid);
      updatePayload.category = (category as any)._id;
    }

    const updatedCourse = await this.courseModel
      .findOneAndUpdate({ uuid }, updatePayload, { new: true })
      .populate('category')
      .populate({ path: 'instructor', select: 'uuid name email role' })
      .exec();

    if (!updatedCourse) {
      throw new NotFoundException(`Course with UUID ${uuid} not found`);
    }
    return updatedCourse;
  }

  async delete(uuid: string): Promise<{ message: string }> {
    const result = await this.courseModel.deleteOne({ uuid }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Course with UUID ${uuid} not found`);
    }

    return { message: `Course with UUID ${uuid} has been deleted` };
  }

  async findByCategory(categoryUuid: string, paginationDto?: PaginationDto): Promise<PaginatedResult<Course>> {
    const category = await this.categoriesService.findOne(categoryUuid);

    return await paginate<Course>(
      this.courseModel,
      { category: (category as any)._id },
      paginationDto,
      {
        populate: [
          { path: 'category' },
          { path: 'instructor', select: 'uuid name email role' },
        ],
        sort: { createdAt: -1 },
      },
    );
  }

  async countByCategoryId(categoryId: string): Promise<number> {
    return await this.courseModel.countDocuments({ category: categoryId as any }).exec();
  }
}
