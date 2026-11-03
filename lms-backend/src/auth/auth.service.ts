import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async register(createUserDto: CreateUserDto) {
        const user = await this.userService.create(createUserDto);

        return user;
    }

    async login(loginDto: LoginDto) {

        // 1. Find the user by email
        const user = await this.userService.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 2. Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(
            loginDto.password,
            user.password,
        );
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 3. Construct JWT payload
        const payload = {
            sub: user.uuid,
            email: user.email,
            role: user.role,
        };

        // 4. Issue signed token
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                uuid: user.uuid,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
}
