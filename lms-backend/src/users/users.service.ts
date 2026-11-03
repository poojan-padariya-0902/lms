import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate, PaginatedResult } from '../common/utils/paginate.util';

@Injectable()
export class UsersService {

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {

        const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();

        if (existingUser) {
            throw new ConflictException(`User with email ${createUserDto.email} already exists.`);
        }

        const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
        const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

        const createdUser = await this.userModel.create({
            ...createUserDto,
            password: hashedPassword,
        })

        const userObj = createdUser.toObject();
        delete (userObj as any).password; // Remove password before returning

        return userObj as User;
    }

    // Used by AuthModule for login credentials verification
    async findByEmail(email: string): Promise<UserDocument | null> {
        return await this.userModel.findOne({ email }).exec();
    }

    async findAll(paginationDto?: PaginationDto): Promise<PaginatedResult<User>> {
        return await paginate<User>(this.userModel, {}, paginationDto, {
            select: '-password',
            sort: { createdAt: -1 },
        });
    }

    async findOne(uuid: string): Promise<User> {
        const user = await this.userModel.findOne({ uuid }).select('-password').exec(); // Exclude password field

        if (!user) {
            throw new NotFoundException(`User with uuid ${uuid} not found.`);
        }

        return user;
    }

    async update(uuid: string, updateUserDto: UpdateUserDto,): Promise<User> {
        const updatePayload: any = { ...updateUserDto };

        // If password is being updated, hash it
        if (updateUserDto.password) {
            const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
            updatePayload.password = await bcrypt.hash(updateUserDto.password, saltRounds);
        }

        const updatedUser = await this.userModel.findOneAndUpdate({ uuid }, updatePayload, { new: true }).select('-password').exec(); // Exclude password field

        if (!updatedUser) {
            throw new NotFoundException(`User with uuid ${uuid} not found.`);
        }

        return updatedUser;
    }

    async remove(uuid: string): Promise<{ message: string}> {
        const result = await this.userModel.deleteOne({ uuid }).exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException(`User with UUID "${uuid}" not found`)
        }

        return { message: `User with UUID "${uuid}" has been deleted.`}
    }
}
