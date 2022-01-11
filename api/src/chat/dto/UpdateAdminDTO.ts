import { RoomI } from './../interfaces/room.interface';
import { IsNumber } from "class-validator";

export class UpdateAdminDTO {
	@IsNumber()
	userId: number;

	roomId: number;
}