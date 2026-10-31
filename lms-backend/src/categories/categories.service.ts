import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class CategoriesService {

  constructor(
    @InjectModel(Category.name) 
    private readonly categoryModel: Model<CategoryDocument>,
    @Inject(forwardRef(() => CoursesService))
    private readonly coursesService: CoursesService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const createdCategory = await this.categoryModel.create(createCategoryDto);
    return createdCategory;
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }
  
  async findOne(uuid: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ uuid }).exec();
    if (!category) {
      throw new NotFoundException(`Category with uuid ${uuid} not found`);
    }
    return category; 
  }

  async update(uuid: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const updatedCategory = await this.categoryModel.findOneAndUpdate({ uuid }, updateCategoryDto, { new: true }).exec();

    if (!updatedCategory) {
      throw new NotFoundException(`Category with uuid ${uuid} not found`);
    }
    return updatedCategory;
  }

  async remove(uuid: string): Promise<{ message: string }> {

    const category = await this.categoryModel.findOne({ uuid });

    if (!category) {
      throw new NotFoundException(`Category with uuid ${uuid} not found`);
    }

    const assignedCourses = await this.coursesService.countByCategoryId((category as any)._id);

    if (assignedCourses > 0) {
      throw new BadRequestException(`Cannot delete category "${category.name}": ${assignedCourses} course(s) are currently assigned to this category. Please reassign or delete those courses first.`);
    }
    const result = await this.categoryModel.deleteOne({ uuid }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Category with uuid ${uuid} not found`);
    }

    return { message: `Category "${category.name}" has been deleted` };
  }
}
