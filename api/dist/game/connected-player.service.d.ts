import { ConnectedPlayerEntity } from './entities/connected-player.entity';
import { Repository } from 'typeorm';
import { ConnectedPlayerI } from './interfaces/connected-player.interface';
import { UserI } from 'src/user/interfaces/user.interface';
export declare class ConnectedPlayerService {
    private connectedPlayerRepository;
    constructor(connectedPlayerRepository: Repository<ConnectedPlayerEntity>);
    create(connectedPlayer: ConnectedPlayerI): Promise<ConnectedPlayerI>;
    deleteBySocketId(socketId: string): Promise<import("typeorm").DeleteResult>;
    findByUser(user: UserI): Promise<ConnectedPlayerI[]>;
    findAll(): Promise<ConnectedPlayerI[]>;
    deleteAll(): Promise<void>;
}
