import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { User } from '../../users/schemas/user.schema';
import { Quiz } from './quiz.schema';
import { Course } from '../../courses/schemas/course.schema';

export type SubmissionDocument = HydratedDocument<Submission>;

@Schema({ timestamps: true })
export class Submission {
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
    ref: Quiz.name,
    required: true,
    index: true,
  })
  quiz: Quiz;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Course.name,
    required: true,
    index: true,
  })
  course: Course;

  @Prop({ type: [Number], required: true })
  selectedAnswers: number[];

  @Prop({ required: true })
  scorePercentage: number;

  @Prop({ required: true })
  isPassed: boolean;

  @Prop({ default: () => new Date() })
  submittedAt: Date;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);

SubmissionSchema.index({ student: 1, quiz: 1, createdAt: -1 });

