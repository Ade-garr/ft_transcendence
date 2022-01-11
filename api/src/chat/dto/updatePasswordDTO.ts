import { IsNumber, IsString } from 'class-validator';
import { RoomStatus } from './../entities/room.entity';
export class updatePasswordDTO {
	status: RoomStatus;

	@IsString()
	oldPassword: string;

	@IsString()
	newPassword: string;

	@IsNumber()
	roomId: number;
}