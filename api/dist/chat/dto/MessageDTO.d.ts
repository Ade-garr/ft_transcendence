import { UserI } from "src/user/interfaces/user.interface";
import { RoomI } from "../interfaces/room.interface";
export declare class MessageDTO {
    content: string;
    user: UserI;
    room: RoomI;
    challenger: number;
    game: number;
}
