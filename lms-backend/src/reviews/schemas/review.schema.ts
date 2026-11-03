import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { User } from '../../users/schemas/user.schema';
import { Course } from '../../courses/schemas/course.schema';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
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
    ref: Course.name,
    required: true,
    index: true,
  })
  course: Course;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: false, trim: true })
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Enforce one review per student per course
ReviewSchema.index({ student: 1, course: 1 }, { unique: true });

// Optimize course reviews sorting and filtering
ReviewSchema.index({ course: 1, rating: -1 });

