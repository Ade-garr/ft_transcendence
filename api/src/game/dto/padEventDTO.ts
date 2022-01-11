import { IsNumber } from "class-validator";

export class PadEventDTO {
	@IsNumber()
	gameId: number;

	@IsNumber()
	move: number;
}