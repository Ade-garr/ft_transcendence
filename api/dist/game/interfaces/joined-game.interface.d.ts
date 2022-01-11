import { UserI } from "src/user/interfaces/user.interface";
export interface JoinedGameI {
    id?: number;
    socketId: string;
    user: UserI;
    gameId: number;
}
