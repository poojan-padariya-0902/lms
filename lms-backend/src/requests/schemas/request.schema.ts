import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { User } from '../../users/schemas/user.schema';

export type RequestDocument = HydratedDocument<ChangeRequest>;

export enum RequestType {
  BECOME_INSTRUCTOR = 'BECOME_INSTRUCTOR',
  PUBLISH_COURSE = 'PUBLISH_COURSE',
  DELETE_COURSE = 'DELETE_COURSE',
  NEW_CATEGORY = 'NEW_CATEGORY',
  REVOKE_STUDENT = 'REVOKE_STUDENT',
  FLAG_REVIEW = 'FLAG_REVIEW',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class ChangeRequest {
  @Prop({ default: () => randomUUID(), unique: true, index: true })
  uuid!: string;

  @Prop({ required: true, unique: true, index: true })
  requestNumber!: string;

  @Prop({
    type: String,
    enum: RequestType,
    required: true,
    index: true,
  })
  type!: RequestType;

  @Prop({
    type: String,
    enum: RequestStatus,
    default: RequestStatus.PENDING,
    index: true,
  })
  status!: RequestStatus;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  requester!: User;

  @Prop({ required: true, trim: true })
  reason!: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  details!: Record<string, any>;

  @Prop({ required: false })
  adminFeedback?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
  })
  reviewedBy?: User;

  @Prop({ required: false })
  reviewedAt?: Date;
}

export const RequestSchema = SchemaFactory.createForClass(ChangeRequest);

