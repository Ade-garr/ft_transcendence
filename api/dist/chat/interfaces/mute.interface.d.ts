import { RoomI } from './room.interface';
export interface MuteUserI {
    id?: number;
    userId: number;
    time: number;
    room: RoomI;
}
