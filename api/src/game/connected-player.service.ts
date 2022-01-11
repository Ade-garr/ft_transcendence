import { ConnectedPlayerEntity } from './entities/connected-player.entity';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { ConnectedPlayerI } from './interfaces/connected-player.interface';
import { UserI } from 'src/user/interfaces/user.interface';

export class ConnectedPlayerService {
	constructor(
		@InjectRepository(ConnectedPlayerEntity)
		private connectedPlayerRepository: Repository<ConnectedPlayerEntity>,
	) {}

	async create(connectedPlayer: ConnectedPlayerI): Promise<ConnectedPlayerI> {
		return this.connectedPlayerRepository.save(this.connectedPlayerRepository.create(connectedPlayer));
	}

	async deleteBySocketId(socketId: string) {
		return this.connectedPlayerRepository.delete({ socketId });
	}

	async findByUser(user: UserI): Promise<ConnectedPlayerI[]> {
		return this.connectedPlayerRepository.find({ user });
	}

	async findAll() : Promise<ConnectedPlayerI[]>{
		return await this.connectedPlayerRepository.find();
	}

	async deleteAll() {
		await this.connectedPlayerRepository
		.createQueryBuilder()
		.delete()
		.execute();
	}
}