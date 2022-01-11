import { UserI } from 'src/user/interfaces/user.interface';
import { PointI } from './point.interface';
export declare enum GameStatus {
    INCOMPLETE = "incomplete",
    INPROGRESS = "in progress",
    PLAYER1WON = "player 1 won",
    PLAYER2WON = "player 2 won"
}
export interface GameI {
    id: number;
    status: GameStatus;
    player1?: number;
    player2?: number;
    acceleration: number;
    direction: PointI;
    score1: number;
    score2: number;
    watchers: UserI[];
    pad1: number;
    pad2: number;
    ball: PointI;
    theme: string;
}
