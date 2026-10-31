import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class UpdateCourseDto {
  @ApiPropertyOptional({
    description: 'Title of the course',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the course',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Course price in USD',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({
    description: 'UUID of the category this course belongs to',
  })
  @IsOptional()
  @IsUUID()
  categoryUuid?: string;
}