import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';
export declare class AuthController {
    private userService;
    private jwtService;
    private authService;
    constructor(userService: UserService, jwtService: JwtService, authService: AuthService);
    login(): void;
    generateJWT(res: Response, req: Request): Promise<void>;
    validate_2fa(res: Response, req: any, code: string): Promise<void>;
}
