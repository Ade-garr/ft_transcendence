import { UserService } from '../user/user.service';
import { fortyTwoUserDTO } from '../user/dto/FortyTwoUserDTO';
import { UserEntity } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    findOrCreate(fortyTwoUser: fortyTwoUserDTO): Promise<UserEntity>;
    generateJwt(user: UserEntity): Promise<string>;
    comparePassword(plainPassword: string, storedPasswordHash: string): Promise<boolean>;
    hashPassword(plainPassword: string): Promise<string>;
    verifyJwt(jwt: string): Promise<any>;
    verify2FAService(id: number, code: string): Promise<boolean>;
}
