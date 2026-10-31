import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { Category } from '../../categories/schemas/category.schema';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true })
export class Course {
  @Prop({ default: () => randomUUID(), unique: true, index: true })
  uuid!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ 
    type: mongoose.Schema.Types.ObjectId,
    ref: Category.name,
    required: true, 
    index: true
  })
  category!: Category;
}

export const CourseSchema = SchemaFactory.createForClass(Course);