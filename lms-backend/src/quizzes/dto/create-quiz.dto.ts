import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({
    description: 'The question text',
    example: 'Which decorator marks a class as a NestJS provider?',
  })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({
    description: 'List of answer choices (options)',
    example: ['@Controller()', '@Injectable()', '@Module()', '@Prop()'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options: string[];

  @ApiProperty({
    description: 'Zero-based index of the correct option',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  correctOptionIndex: number;
}

export class CreateQuizDto {
  @ApiProperty({ description: 'Title of the quiz', example: 'NestJS Fundamentals Quiz' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Description or instructions for the quiz',
    example: 'Test your knowledge on NestJS modules, providers, and controllers.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'UUID of the parent course' })
  @IsUUID()
  @IsNotEmpty()
  courseUuid: string;

  @ApiProperty({
    description: 'Minimum percentage required to pass (0 to 100)',
    example: 70,
    default: 70,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  passingScorePercentage: number;

  @ApiProperty({
    description: 'Questions in the quiz',
    type: [CreateQuestionDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}

