import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "../schemas/user.schema";

export class CreateUserDto {
    @ApiProperty({ description: 'Name of the user'})
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ description: 'Email of the user'})
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ description: 'Password of the user'})
    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password!: string;

    @ApiProperty({ enum: UserRole, default: UserRole.STUDENT, description: 'Role of the user' })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}