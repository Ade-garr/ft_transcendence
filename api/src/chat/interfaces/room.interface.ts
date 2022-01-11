 import { UserI } from "src/user/interfaces/user.interface";
import { RoomStatus } from "../entities/room.entity";

export interface RoomI {
    id: number;
    title: string;
    users: UserI[];
    status: RoomStatus;
    created_at?: Date;
    updated_at?: Date;
    admins?: number[];
    owner?: number;
    password?: string;
    bans?: number[];
}