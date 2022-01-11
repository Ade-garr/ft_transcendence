import { createGameDTO } from './dto/createGameDTO';
import { UserService } from './../user/user.service';
import { GameEntity } from './entities/game.entity';
import { Repository } from 'typeorm';
import { GameI } from './interfaces/game.interface';
export declare class GameService {
    private gameRepository;
    private readonly userService;
    constructor(gameRepository: Repository<GameEntity>, userService: UserService);
    createGameI(player1Id: number, createGame: createGameDTO, id: number): Promise<GameI>;
    save(game: GameI): Promise<GameEntity>;
}
