import { RoomI } from './../interfaces/room.interface';
import { IsNumber } from "class-validator";

export class MuteUserDTO {

	@IsNumber()
	id: number;

	room: RoomI;

	@IsNumber()
	duration: number;
}