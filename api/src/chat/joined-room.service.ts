import { UserService } from './../user/user.service';
import { RoomI } from './interfaces/room.interface';
import { UserI } from './../user/interfaces/user.interface';
import { JoinedRoomI } from './interfaces/joined-room.interface';
import { JoinedRoomEntity } from './entities/joined-room.entity';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';

@Injectable()
export class JoinedRoomService {
	constructor(
		@InjectRepository(JoinedRoomEntity)
		private readonly joinedRoomRepository: Repository<JoinedRoomEntity>,
		private readonly userService: UserService,
	) {} 

	async create(joinedRoom: JoinedRoomI): Promise<JoinedRoomI> {
		return this.joinedRoomRepository.save(joinedRoom);
	}

	async findByUser(user: UserI): Promise<JoinedRoomI[]> {
		return this.joinedRoomRepository.find({ user });
	}

	async findByRoom(room: RoomI): Promise<JoinedRoomI[]> {
		return this.joinedRoomRepository
		.createQueryBuilder('joined_room_entity')
		.leftJoin('joined_room_entity.room', 'room')
		.where('room.id = :roomId', {roomId: room.id})
		.getMany();
	}

	async deleteBySocketId(socketId: string) {
		return await this.joinedRoomRepository.delete({ socketId });
	}

	async removeUserFromRoomId(user: UserI, room: RoomI) {
		const userId = user.id;
		const roomId = room.id;
		await this.joinedRoomRepository
		.createQueryBuilder('joined_room_entity')
		.leftJoin('joined_room_entity.room', 'room')
		.where('room.id = :roomId', {roomId})
		.leftJoin('joined_room_entity.user', 'user')
		.andWhere('user.id = :userId', {userId})
		.delete()
		.execute()
	}

	async disconnectAllInRoom( roomId: number ) {
		this.joinedRoomRepository
		.createQueryBuilder('joined_room_entity')
		.leftJoin('joined_room_entity.room', 'room')
		.where('room.id = :roomId', {roomId})
		.delete()
		.execute()
	}

	async deleteAll() {
		await this.joinedRoomRepository
		.createQueryBuilder()
		.delete()
		.execute();
	}
}