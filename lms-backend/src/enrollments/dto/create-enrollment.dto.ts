import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({
    description: 'UUID of the course to enroll in',
  })
  @IsUUID()
  @IsNotEmpty()
  courseUuid: string;

  @ApiPropertyOptional({
    description:
      'UUID of the student to enroll (optional: defaults to currently authenticated user; Admins can provide any student UUID)',
  })
  @IsOptional()
  @IsUUID()
  studentUuid?: string;
}