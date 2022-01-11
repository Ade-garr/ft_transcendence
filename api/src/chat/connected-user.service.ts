import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserI } from "src/user/interfaces/user.interface";
import { Repository } from "typeorm";
import { ConnectedUserEntity } from "./entities/connected-user.entity";
import { ConnectedUserI } from "./interfaces/connected-user.interface";

@Injectable()
export class ConnectedUserService {
	constructor(
		@InjectRepository(ConnectedUserEntity)
		private readonly connectedUserRepository: Repository<ConnectedUserEntity>
	) {}

	async create(connectedUser: ConnectedUserI): Promise<ConnectedUserI> {
		return this.connectedUserRepository.save(connectedUser);
	} 

	async findByUser(user: UserI): Promise<ConnectedUserI[]> {
		return this.connectedUserRepository.find({ user });
	}

	async deleteBySocketId(socketId: string) {
		return this.connectedUserRepository.delete({ socketId });
	}

	async findAll(): Promise<ConnectedUserI[]> {
		return this.connectedUserRepository
		.createQueryBuilder('connected_user_entity')
		.leftJoinAndSelect('connected_user_entity.user', 'all_users')
		.getMany();
	}

	async deleteAll() {
		await this.connectedUserRepository
		.createQueryBuilder()
		.delete()
		.execute();
	}
}