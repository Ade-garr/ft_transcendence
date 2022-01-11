/// <reference types="multer" />
import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity';
import { Response } from 'express';
import { BannedService } from './banned.service';
export declare class UserController {
    private readonly userService;
    private readonly bannedService;
    constructor(userService: UserService, bannedService: BannedService);
    addBlocked(id: number, req: any): Promise<void>;
    addFriend(id: number, req: any): Promise<void>;
    findAllFriends(req: any): Promise<UserEntity[]>;
    findAllBlocked(req: any): Promise<UserEntity[]>;
    uploadSingle(file: Express.Multer.File, req: any): Promise<void>;
    returnSecret(req: any): Promise<{
        url: string;
    }>;
    disable2fa(req: any): Promise<void>;
    update_name(req: any): Promise<void>;
    verify_2FA(req: any, code: string): Promise<void>;
    getUserProfile(req: any): any;
    deleteUser(res: Response, req: any): Promise<void>;
    findAll(): Promise<UserEntity[]>;
    deleteUserAsAdmin(id: number): Promise<void>;
    logout(res: Response): Promise<void>;
    getLeaderBoard(): Promise<UserEntity[]>;
    getAchievements(): string[];
    getPublicUserInfo(id: number): Promise<UserEntity>;
    banUser(id: number): Promise<void>;
    unbanUser(id: number): Promise<void>;
    getUsername(id: number): Promise<string>;
}
