import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('users')
@ApiConsumes('application/x-www-form-urlencoded')
@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) {}

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.create(createUserDto);
    }

    @Get()
    async findAll(@Query() paginationDto: PaginationDto) {
        return await this.usersService.findAll(paginationDto);
    }

    @Get(':uuid')
    async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return await this.usersService.findOne(uuid);
    }

    @Patch(':uuid')
    async update(@Param('uuid', ParseUUIDPipe) uuid: string, @Body() updateUserDto: any) {
        return await this.usersService.update(uuid, updateUserDto);
    }

    @Delete(':uuid')
    async remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return await this.usersService.remove(uuid);
    }
}
