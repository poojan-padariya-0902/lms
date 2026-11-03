import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { Course } from '../../courses/schemas/course.schema';

export type QuizDocument = HydratedDocument<Quiz>;

@Schema({ _id: false })
export class Question {
  @Prop({ required: true })
  questionText: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ required: true, select: false }) // Hide correct answer from students when taking the quiz!
  correctOptionIndex: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ default: () => randomUUID(), unique: true, index: true })
  uuid: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: false })
  description: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Course.name,
    required: true,
    index: true,
  })
  course: Course;

  @Prop({ type: [QuestionSchema], required: true })
  questions: Question[];

  @Prop({ required: true, default: 70, min: 0, max: 100 })
  passingScorePercentage: number;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

