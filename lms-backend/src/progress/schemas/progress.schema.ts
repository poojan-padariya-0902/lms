import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { User } from '../../users/schemas/user.schema';
import { Lesson } from '../../lessons/schemas/lesson.schema';
import { Course } from '../../courses/schemas/course.schema';

export type ProgressDocument = HydratedDocument<Progress>;

@Schema({ timestamps: true })
export class Progress {
  @Prop({ default: () => randomUUID(), unique: true, index: true })
  uuid: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  student: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Lesson.name,
    required: true,
    index: true,
  })
  lesson: Lesson;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Course.name,
    required: true,
    index: true,
  })
  course: Course;

  @Prop({ default: true })
  isCompleted: boolean;

  @Prop({ default: () => new Date() })
  completedAt: Date;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);

// Enforce one progress entry per student-lesson pair
ProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });

// Fast lookup for course progress percentage calculations
ProgressSchema.index({ student: 1, course: 1, isCompleted: 1 });