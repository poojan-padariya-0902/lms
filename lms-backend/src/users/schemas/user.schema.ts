import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { randomUUID } from "crypto";

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
    ADMIN = 'admin',
    INSTRUCTOR = 'instructor',
    STUDENT = 'student',
}

@Schema({ timestamps: true })
export class User {

    @Prop({ default: () => randomUUID(), unique: true, index: true })
    uuid!: string;

    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ required: true, unique: true, lowercase:true, trim: true })
    email!: string;

    @Prop({ required: true, trim: true })
    password!: string;

    @Prop({ required: true, enum: UserRole, default: UserRole.STUDENT })
    role!: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);