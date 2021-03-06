import { UserService } from '../user/user.service';
import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class RolesGuard implements CanActivate {
    private userService;
    constructor(userService: UserService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
