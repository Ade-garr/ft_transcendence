import { forwardRef, Inject, InternalServerErrorException } from '@nestjs/common';
import { createGameDTO } from './dto/createGameDTO';
import { UserService } from './../user/user.service';
import { GameEntity } from './entities/game.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameI, GameStatus } from './interfaces/game.interface';

@Injectable()
export class GameService {
	constructor(
		@InjectRepository(GameEntity)
		private gameRepository: Repository<GameEntity>,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
	) {}

	async createGameI(player1Id: number, createGame: createGameDTO, id: number) {
		const game: GameI = {
			id: id,
			status: GameStatus.INCOMPLETE,
			player1: player1Id,
			player2: createGame.player2,
			acceleration: createGame.acceleration,
			theme: createGame.theme,
			score1: 0,
			score2: 0,
			watchers: [],
			direction: {x: 1, y: 1},
			pad1: 240 - 34,
			pad2: 240 - 34,
			ball: {
			  x: 325,
			  y: 240,
			}
		};
		return game;
	}

	async save(game: GameI): Promise<GameEntity> {
		try {
			const saveGame: GameEntity = this.gameRepository.create({
				player1: game.player1,
				player2: game.player2,
				score1: game.score1,
				score2: game.score2,
			});
			return await this.gameRepository.save(saveGame);
		} catch ( error ) {
			console.log( error );
			throw new InternalServerErrorException('save game');
		}
	}
}
