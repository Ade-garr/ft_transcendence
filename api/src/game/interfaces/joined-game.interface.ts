import { UserI } from "src/user/interfaces/user.interface";
import { GameI } from "./game.interface";

export interface JoinedGameI {
	id?: number,
	socketId: string;
	user: UserI;
	gameId: number;
}