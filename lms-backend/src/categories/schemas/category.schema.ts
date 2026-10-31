import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { randomUUID } from "node:crypto";

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
    @Prop({ default: () => randomUUID(), unique: true, index: true })
    uuid!: string;

    @Prop({ required: true, unique: true, trim: true })
    name!: string;

    @Prop({ required: false })
    description?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);