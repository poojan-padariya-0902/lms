import { Injectable, NotFoundException } from '@nestjs/common';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CoursesService } from '../courses/courses.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { Course } from '../courses/schemas/course.schema';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate, PaginatedResult } from '../common/utils/paginate.util';

@Injectable()
export class LessonsService {
    constructor(
        @InjectModel(Lesson.name)
        private readonly lessonModel: Model<LessonDocument>,
        private readonly coursesService: CoursesService,
    ) {}

    async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
        const course = await this.coursesService.findOne(createLessonDto.courseUuid);

        const { courseUuid, ...lessonData } = createLessonDto;
        const createdLesson = await this.lessonModel.create({
            ...lessonData,
            course: (course as any)._id
        })

        return await this.findOne(createdLesson.uuid)
    }

    async findAll(paginationDto?: PaginationDto): Promise<PaginatedResult<Lesson>> {
        return await paginate<Lesson>(this.lessonModel, {}, paginationDto, {
            populate: 'course',
            sort: { course: 1, order: 1 },
        });
    }

    async findOne(uuid: string): Promise<Lesson> {
        const lesson = await this.lessonModel.findOne({ uuid }).populate('course').exec();

        if (!lesson) {
            throw new NotFoundException(`Lesson with UUID "${uuid}" not found`)
        }

        return lesson
    }

    async findByCourse(courseUuid: string, paginationDto?: PaginationDto): Promise<PaginatedResult<Lesson>> {
        const course = await this.coursesService.findOne(courseUuid);

        return await paginate<Lesson>(
            this.lessonModel,
            { course: (course as any)._id },
            paginationDto,
            {
                populate: 'course',
                sort: { order: 1 },
            },
        );
    }

    async update(uuid: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
        const { courseUuid, ...updateData } = updateLessonDto
        const updatePayload: any = { ...updateData };

        if (courseUuid) {
            const course = await this.coursesService.findOne(courseUuid);
            updatePayload.course = (course as any)._id;
        }

        const updatedLesson = await this.lessonModel.findOneAndUpdate({ uuid }, updatePayload, { new: true }).populate('course').exec();

        if (!updatedLesson) {
            throw new NotFoundException(`Lesson with UUID ${uuid} not found`);
        }

        return updatedLesson;
    }

    async delete(uuid: string): Promise<{ message: string }> {
        const result = await this.lessonModel.deleteOne({ uuid }).exec();
        if (result.deletedCount === 0) {
        throw new NotFoundException(`Lesson with UUID ${uuid} not found`);
        }

        return { message: `Lesson with UUID ${uuid} has been deleted` };
    }

    async countByCourseId(courseId: any): Promise<number> {
        return await this.lessonModel.countDocuments({ course: courseId }).exec();
    }
}
