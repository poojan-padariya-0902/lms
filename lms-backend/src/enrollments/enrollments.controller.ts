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
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('my-courses')
  async findMyEnrollments(
    @Req() req: any,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.enrollmentsService.findMyEnrollments(
      req.user.uuid,
      paginationDto,
    );
  }

  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Get('course/:courseUuid')
  async findByCourse(
    @Param('courseUuid', ParseUUIDPipe) courseUuid: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.enrollmentsService.findByCourse(courseUuid, paginationDto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.enrollmentsService.findAll(paginationDto);
  }

  @Get(':uuid')
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return await this.enrollmentsService.findOne(uuid);
  }

  @Post()
  @ApiConsumes('application/x-www-form-urlencoded')
  async create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @Req() req: any,
  ) {
    // If studentUuid is specified and differs from the caller, require ADMIN role
    if (
      createEnrollmentDto.studentUuid &&
      createEnrollmentDto.studentUuid !== req.user.uuid &&
      req.user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only administrators can enroll other students',
      );
    }

    return await this.enrollmentsService.create(
      createEnrollmentDto,
      req.user.uuid,
    );
  }

  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Patch(':uuid/status')
  @ApiConsumes('application/x-www-form-urlencoded')
  async updateStatus(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updateDto: UpdateEnrollmentStatusDto,
  ) {
    return await this.enrollmentsService.updateStatus(uuid, updateDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':uuid')
  async delete(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return await this.enrollmentsService.delete(uuid);
  }
}