import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitQuizDto {
  @ApiProperty({
    description: 'Array of selected option indices corresponding to each question',
    example: [1, 0, 2],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(0, { each: true })
  selectedAnswers: number[];
}

