import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { RequestType } from '../schemas/request.schema';

export class CreateRequestDto {
  @ApiProperty({ enum: RequestType, description: 'Type of change request' })
  @IsEnum(RequestType)
  @IsNotEmpty()
  type!: RequestType;

  @ApiProperty({
    description: 'Mandatory genuine reason justifying this request',
    example: '5 years senior engineer, proposing comprehensive Next.js course',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Please provide a genuine, detailed reason (at least 10 characters)' })
  reason!: string;

  @ApiPropertyOptional({
    description: 'Optional payload details (e.g. courseUuid, categoryName, studentUuid)',
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}

