import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CanActivate } from '@nestjs/common';
export declare class JwtSocketCookie implements CanActivate {
    private readonly jwtService;
    private readonly userService;
    constructor(jwtService: JwtService, userService: UserService);
    canActivate(context: any): Promise<boolean>;
}
