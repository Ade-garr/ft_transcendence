import { UserI } from "src/user/interfaces/user.interface";
export interface ConnectedPlayerI {
    id?: number;
    socketId: string;
    user: UserI;
}
