import { RoomStatus } from './../entities/room.entity';
import { IsOptional, IsString, Length } from "class-validator";

export class createRoomDTO {
	@IsString()
	@Length(3, 20)
	title: string;

	status: RoomStatus;

	@IsString()
	@Length(10, 20)
	@IsOptional()
	password: string;
}