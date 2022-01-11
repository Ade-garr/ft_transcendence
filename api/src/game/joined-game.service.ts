import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JoinedGameEntity } from "./entities/joined-game.entity";
import { JoinedGameI } from "./interfaces/joined-game.interface";

export class JoinedGameService {
	constructor(
		@InjectRepository(JoinedGameEntity)
		private joinedGameRepository: Repository<JoinedGameEntity>,
	) {}

	async create(joinedGame: JoinedGameI): Promise<JoinedGameI> {
		return this.joinedGameRepository.save(joinedGame);
	}

	async findByGame(gameId: number): Promise<JoinedGameI[]> {
		return this.joinedGameRepository
		.createQueryBuilder('joined_game_entity')
		.where('joined_game_entity.gameId = :gameId', {gameId})
		.leftJoinAndSelect('joined_game_entity.user', 'user')
		.getMany();
	}

	async disconnectAllInGame(gameId: number) {
		this.joinedGameRepository
		.createQueryBuilder('joined_game_entity')
		.where('game.id = :gameId', {gameId})
		.delete()
		.execute();
	}

	async deleteAll() {
		await this.joinedGameRepository
		.createQueryBuilder()
		.delete()
		.execute();
	}
}