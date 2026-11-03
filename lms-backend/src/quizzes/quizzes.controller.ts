import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Post()
  async create(@Body() createQuizDto: CreateQuizDto) {
    return await this.quizzesService.create(createQuizDto);
  }

  @Get('course/:courseUuid')
  async findByCourse(
    @Param('courseUuid', ParseUUIDPipe) courseUuid: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.quizzesService.findByCourse(courseUuid, paginationDto);
  }

  @Get(':uuid')
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return await this.quizzesService.findOne(uuid);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':uuid/submit')
  async submitQuiz(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() submitDto: SubmitQuizDto,
    @CurrentUser('uuid') userUuid: string,
  ) {
    return await this.quizzesService.submitQuiz(uuid, userUuid, submitDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':uuid/my-submissions')
  async getMySubmissions(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser('uuid') userUuid: string,
  ) {
    return await this.quizzesService.getMySubmissions(uuid, userUuid);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Delete(':uuid')
  async delete(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return await this.quizzesService.delete(uuid);
  }
}

