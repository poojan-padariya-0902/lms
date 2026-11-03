import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RequestStatus } from '../schemas/request.schema';

export class ReviewRequestDto {
  @ApiProperty({
    enum: [RequestStatus.APPROVED, RequestStatus.REJECTED],
    description: 'Decision on the request',
  })
  @IsEnum([RequestStatus.APPROVED, RequestStatus.REJECTED])
  @IsNotEmpty()
  status!: RequestStatus.APPROVED | RequestStatus.REJECTED;

  @ApiPropertyOptional({
    description: 'Constructive feedback or administrative notes for the requester',
  })
  @IsOptional()
  @IsString()
  adminFeedback?: string;
}

