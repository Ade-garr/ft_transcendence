import { IsNumber } from 'class-validator';

export class PartialGameDTO {
	@IsNumber()
	gameId: number;

	@IsNumber()
	move: number;

	@IsNumber()
	player1: number;

	@IsNumber()
	player2: number;

}