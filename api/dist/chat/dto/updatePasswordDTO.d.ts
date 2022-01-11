import { RoomStatus } from './../entities/room.entity';
export declare class updatePasswordDTO {
    status: RoomStatus;
    oldPassword: string;
    newPassword: string;
    roomId: number;
}
