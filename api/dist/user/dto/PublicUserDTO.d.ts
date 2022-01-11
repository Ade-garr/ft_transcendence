import { UserStatus } from './../entities/user.entity';
export declare class publicUserDTO {
    id: number;
    username: string;
    avatar?: string;
    status: UserStatus;
    victories: number;
    losses: number;
    ratio: number;
    achievements: string;
}
