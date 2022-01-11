import { IsString, Length } from "class-validator";
import { UserI } from "src/user/interfaces/user.interface";
import { RoomI } from "../interfaces/room.interface";

export class MessageDTO {
	@IsString()
	@Length(1, 150)
	content: string;

	user: UserI;

	room: RoomI;

	challenger: number;

	game: number;
}