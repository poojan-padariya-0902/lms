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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('course/:courseUuid/stats')
  async getCourseStats(
    @Param('courseUuid', ParseUUIDPipe) courseUuid: string,
  ) {
    return await this.reviewsService.getCourseStats(courseUuid);
  }

  @Get('course/:courseUuid')
  async findByCourse(
    @Param('courseUuid', ParseUUIDPipe) courseUuid: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.reviewsService.findByCourse(courseUuid, paginationDto);
  }

  @Get(':uuid')
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return await this.reviewsService.findOne(uuid);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post()
  async create(
    @Body() dto: CreateReviewDto,
    @CurrentUser('uuid') userUuid: string,
  ) {
    return await this.reviewsService.create(dto, userUuid);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('application/x-www-form-urlencoded')
  @Patch(':uuid')
  async update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: any,
  ) {
    const isAdmin = user.role === UserRole.ADMIN;
    return await this.reviewsService.update(uuid, user.uuid, dto, isAdmin);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':uuid')
  async delete(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: any,
  ) {
    const isAdmin = user.role === UserRole.ADMIN;
    return await this.reviewsService.delete(uuid, user.uuid, isAdmin);
  }
}
