import { UserEntity } from 'src/user/entities/user.entity';
export declare class JoinedGameEntity {
    id: number;
    socketId: string;
    user: UserEntity;
    gameId: number;
}
