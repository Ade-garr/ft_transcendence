import { IsNumber } from "class-validator";
import { RoomI } from "../interfaces/room.interface";

export class RoomUserDTO {

	@IsNumber()
	userId: number;

	room: RoomI;
}