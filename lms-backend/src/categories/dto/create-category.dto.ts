import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {

    @ApiProperty({
        description: 'Name of the category',
    })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiPropertyOptional({
        description: 'Description of the category',
    })
    @IsOptional()
    @IsString()
    description?: string;
}
