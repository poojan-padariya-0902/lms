import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { ReviewRequestDto } from './dto/review-request.dto';
import { RequestStatus, RequestType } from './schemas/request.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDto: CreateRequestDto, @Req() req: any) {
    return await this.requestsService.create(createDto, req.user.uuid);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-requests')
  async findMyRequests(@Req() req: any, @Query() paginationDto: PaginationDto) {
    return await this.requestsService.findMyRequests(req.user.uuid, paginationDto);
  }

  @Get('track/:requestNumber')
  async track(@Param('requestNumber') requestNumber: string) {
    return await this.requestsService.findByRequestNumber(requestNumber);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(
    @Query('type') type?: RequestType,
    @Query('status') status?: RequestStatus,
    @Query() paginationDto?: PaginationDto,
  ) {
    return await this.requestsService.findAll(type, status, paginationDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    return await this.requestsService.findOne(uuid);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':uuid/review')
  async review(
    @Param('uuid') uuid: string,
    @Body() reviewDto: ReviewRequestDto,
    @Req() req: any,
  ) {
    return await this.requestsService.review(uuid, reviewDto, req.user.uuid);
  }
}

