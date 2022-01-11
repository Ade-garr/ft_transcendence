import { Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/entities/user.entity';
import { BannedService } from 'src/user/banned.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userService;
    private readonly bannedService;
    constructor(userService: UserService, bannedService: BannedService);
    validate(payload: any): Promise<UserEntity>;
}
export {};
