import { RoomI } from './interfaces/room.interface';
import { MuteEntity } from './entities/mute.entity';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';

@Injectable()
export class MuteService {
	constructor(
		@InjectRepository(MuteEntity)
		private readonly muteUserRepository: Repository<MuteEntity>,
	) {}


	async create(userId: number, time: string, room: RoomI): Promise<MuteEntity> {
		const mute = this.muteUserRepository.create({
			userId: userId,
			time: time,
			room: room,
		});
		return await this.muteUserRepository.save(mute);
	}
}