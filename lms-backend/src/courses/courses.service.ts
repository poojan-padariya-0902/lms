import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const category = await this.categoriesService.findOne(
      createCourseDto.categoryUuid,
    );

    const { categoryUuid, ...courseData } = createCourseDto;
    const createdCourse = await this.courseModel.create({
      ...courseData,
      category: (category as any)._id,
    });

    return await this.findOne(createdCourse.uuid);
  }

  async findAll(): Promise<Course[]> {
    return await this.courseModel
      .find()
      .populate('category')
      .exec();
  }

  async findOne(uuid: string): Promise<Course> {
    const course = await this.courseModel
      .findOne({ uuid })
      .populate('category')
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

  async findByCategory(categoryUuid: string): Promise<Course[]> {
    const category = await this.categoriesService.findOne(categoryUuid);

    return await this.courseModel
      .find({ category: (category as any)._id })
      .populate('category')
      .exec();
  }

  async countByCategoryId(categoryId: string): Promise<number> {
    return await this.courseModel.countDocuments({ category: categoryId as any }).exec();
  }
}