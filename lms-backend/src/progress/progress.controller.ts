import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('my-progress')
  async getMyProgress(@Req() req: any) {
    return await this.progressService.getMyProgress(req.user.uuid);
  }

  @Get('course/:courseUuid')
  async getCourseProgress(
    @Param('courseUuid', ParseUUIDPipe) courseUuid: string,
    @Req() req: any,
  ) {
    return await this.progressService.getCourseProgress(
      courseUuid,
      req.user.uuid,
    );
  }

  @Put('lesson/:lessonUuid')
  @ApiConsumes('application/x-www-form-urlencoded')
  async updateLessonProgress(
    @Param('lessonUuid', ParseUUIDPipe) lessonUuid: string,
    @Body() updateDto: UpdateProgressDto,
    @Req() req: any,
  ) {
    return await this.progressService.updateLessonProgress(
      lessonUuid,
      req.user.uuid,
      updateDto,
    );
  }
}