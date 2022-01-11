import { CanActivate } from '@nestjs/common';
export declare class OwnerGuard implements CanActivate {
    constructor();
    canActivate(context: any): Promise<boolean>;
}
