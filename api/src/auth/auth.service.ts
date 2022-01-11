import {
    InternalServerErrorException,
    forwardRef,
    Inject,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { fortyTwoUserDTO } from '../user/dto/FortyTwoUserDTO';
import { UserEntity } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    async findOrCreate(fortyTwoUser: fortyTwoUserDTO): Promise<UserEntity> {
        try {
            const user = await this.userService.findOneById(fortyTwoUser.id);
            if (!user) {
                return await this.userService.createUser(fortyTwoUser);
            }
            return user;
        } catch ( error ) {
            console.log( error );
            throw new InternalServerErrorException('findOrCreate');
        }
    }

    async generateJwt(user: UserEntity): Promise<string> {
        return await this.jwtService.signAsync(user);
    }

    async comparePassword(plainPassword: string, storedPasswordHash: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, storedPasswordHash);
    }

    async hashPassword(plainPassword: string): Promise<string> {
        return await bcrypt.hash(plainPassword, 12);
    }

    async verifyJwt(jwt: string): Promise<any> {
        try {
            const validToken = await this.jwtService.verifyAsync(jwt, { secret: process.env.JWT_SECRET });
            if (!validToken) throw new UnauthorizedException();
            return validToken;
        } catch ( error ) {
            console.log( error );
            throw new InternalServerErrorException('verifyJwt');
        }
    }

    async verify2FAService(id: number, code: string) {
        return await this.userService.verify2FAService(id, code);
    }
}

