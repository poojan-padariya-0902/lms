import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.lessonsService.findAll(paginationDto);
  }

  @Get('course/:courseUuid')
  async findByCourse(
    @Param('courseUuid', ParseUUIDPipe) courseUuid: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.lessonsService.findByCourse(courseUuid, paginationDto);
  }

  @Get(':uuid')
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return await this.lessonsService.findOne(uuid);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post()
  async create(@Body() createLessonDto: CreateLessonDto) {
    return await this.lessonsService.create(createLessonDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiConsumes('application/x-www-form-urlencoded')
  @Patch(':uuid')
  async update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return await this.lessonsService.update(uuid, updateLessonDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Delete(':uuid')
  async delete(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return await this.lessonsService.delete(uuid);
  }
}