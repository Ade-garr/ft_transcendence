import { UserI } from "src/user/interfaces/user.interface";
import { Repository } from "typeorm";
import { ConnectedUserEntity } from "./entities/connected-user.entity";
import { ConnectedUserI } from "./interfaces/connected-user.interface";
export declare class ConnectedUserService {
    private readonly connectedUserRepository;
    constructor(connectedUserRepository: Repository<ConnectedUserEntity>);
    create(connectedUser: ConnectedUserI): Promise<ConnectedUserI>;
    findByUser(user: UserI): Promise<ConnectedUserI[]>;
    deleteBySocketId(socketId: string): Promise<import("typeorm").DeleteResult>;
    findAll(): Promise<ConnectedUserI[]>;
    deleteAll(): Promise<void>;
}
