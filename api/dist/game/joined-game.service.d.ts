import { Repository } from "typeorm";
import { JoinedGameEntity } from "./entities/joined-game.entity";
import { JoinedGameI } from "./interfaces/joined-game.interface";
export declare class JoinedGameService {
    private joinedGameRepository;
    constructor(joinedGameRepository: Repository<JoinedGameEntity>);
    create(joinedGame: JoinedGameI): Promise<JoinedGameI>;
    findByGame(gameId: number): Promise<JoinedGameI[]>;
    disconnectAllInGame(gameId: number): Promise<void>;
    deleteAll(): Promise<void>;
}
