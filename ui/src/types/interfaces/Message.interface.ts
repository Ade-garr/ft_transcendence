import User from "../User";
import RoomI from "./Room.interface";

export default interface MessageI {
	// id?: number;
	content: string;
	user: User;
	room: RoomI;
	challenger: number;
	game: number;
	// created_at?: Date;
}