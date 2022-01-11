import { Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/entities/user.entity';
declare const TFAStrategy_base: new (...args: any[]) => Strategy;
export declare class TFAStrategy extends TFAStrategy_base {
    private readonly userService;
    constructor(userService: UserService);
    validate(payload: any): Promise<UserEntity>;
}
export {};
