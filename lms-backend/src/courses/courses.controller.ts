import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.coursesService.findAll(paginationDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Get('instructor/my-courses')
  async findMyCourses(@Req() req: any, @Query() paginationDto: PaginationDto) {
    return await this.coursesService.findMyCourses(req.user.uuid, paginationDto);
  }

  @Get('category/:categoryUuid')
  async findByCategory(
    @Param('categoryUuid', ParseUUIDPipe) categoryUuid: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.coursesService.findByCategory(categoryUuid, paginationDto);
  }

  @Get(':uuid')
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return await this.coursesService.findOne(uuid);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post()
  async create(@Body() createCourseDto: CreateCourseDto, @Req() req: any) {
    return await this.coursesService.create(createCourseDto, req.user.uuid);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiConsumes('application/x-www-form-urlencoded')
  @Patch(':uuid')
  async update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Req() req: any,
  ) {
    const course = await this.coursesService.findOne(uuid);
    const isOwner =
      course.instructor && (course.instructor as any).uuid === req.user.uuid;
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only update courses that you created');
    }

    return await this.coursesService.update(uuid, updateCourseDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Delete(':uuid')
  async delete(@Param('uuid', ParseUUIDPipe) uuid: string, @Req() req: any) {
    const course = await this.coursesService.findOne(uuid);
    const isOwner =
      course.instructor && (course.instructor as any).uuid === req.user.uuid;
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only delete courses that you created');
    }

    return await this.coursesService.delete(uuid);
  }
}
