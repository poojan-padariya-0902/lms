import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Title of the course',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Detailed description of the course',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'Course price in USD',
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiProperty({
    description: 'UUID of the category this course belongs to',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryUuid!: string;
}