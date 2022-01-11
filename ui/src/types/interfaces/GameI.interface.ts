import { PointI } from './PointI.interface'
import User from '../User'

export enum GameStatus {
	INCOMPLETE="incomplete",
	INPROGRESS="in progress",
	PLAYER1WON="player 1 won",
	PLAYER2WON="player 2 won",
}


export default interface GameI {
    id: number;
	status: GameStatus;
	player1?: number;
	player2?: number;
	acceleration: number;
	direction: PointI;
	score1: number;
	score2: number;
	watchers: User[];
	pad1: number; //y coordinate
	pad2: number; //y coordinate
	ball: PointI;
	theme: string;
}
