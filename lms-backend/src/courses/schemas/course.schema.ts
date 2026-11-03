import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { Category } from '../../categories/schemas/category.schema';
import { User } from '../../users/schemas/user.schema';

export type CourseDocument = HydratedDocument<Course>;

export enum CourseStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

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

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
    index: true,
  })
  instructor?: User;

  @Prop({
    type: String,
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
    index: true,
  })
  status!: CourseStatus;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
