import { UserI } from "src/user/interfaces/user.interface";
import { RoomI } from "./room.interface";
export interface MessageI {
    id?: number;
    content: string;
    user: UserI;
    room: RoomI;
    challenger: number;
    game: number;
    created_at?: Date;
}
