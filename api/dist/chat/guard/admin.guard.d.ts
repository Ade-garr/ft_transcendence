import { CanActivate } from '@nestjs/common';
export declare class AdminGuard implements CanActivate {
    constructor();
    canActivate(context: any): Promise<boolean>;
}
