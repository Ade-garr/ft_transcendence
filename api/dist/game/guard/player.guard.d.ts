import { CanActivate } from '@nestjs/common';
export declare class PlayerGuard implements CanActivate {
    constructor();
    canActivate(context: any): Promise<boolean>;
}
