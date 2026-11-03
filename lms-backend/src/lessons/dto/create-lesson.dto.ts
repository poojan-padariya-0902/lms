import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateLessonDto {

    @ApiProperty({ description: 'Title of the lesson' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({ description: 'Content of the lesson' })
    @IsOptional()
    @IsString()
    content?: string;

    @ApiPropertyOptional({ description: 'Video URL of the lesson' })
    @IsOptional()
    @IsString()
    videoUrl?: string;

    @ApiProperty({ description: 'Duration of the lesson in minutes', default: 0 })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    durationMinutes: number;

    @ApiProperty({ description: 'Order of the lesson in the course', default: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    order: number;

    @ApiPropertyOptional({ description: 'Whether unentrolled users can preview the lesson for free', default: false })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
    })
    @IsBoolean()
    isFreePreview?: boolean;

    @ApiProperty({ description: 'UUID of the parent course this lesson belongs to' })
    @IsUUID()
    @IsNotEmpty()
    courseUuid: string;
}