import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { randomUUID } from "node:crypto";
import { Course } from "../../courses/schemas/course.schema";

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({ timestamps: true })
export class Lesson {
    @Prop({ default: () => randomUUID(), unique:true, index: true })
    uuid: string;

    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: false })
    content: string;

    @Prop({ required: false })
    videoUrl: string;

    @Prop({ required: true, default: 0 })
    durationMinutes: number;

    @Prop({ required: true, default: 1 })
    order: number;

    @Prop({ default: false })
    isFreePreview: boolean;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Course.name,
        required: true,
        index: true,
    })
    course: Course;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

LessonSchema.index({ course: 1, order: 1 });