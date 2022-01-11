import { UserEntity } from 'src/user/entities/user.entity';
export declare class ConnectedUserEntity {
    id: number;
    socketId: string;
    user: UserEntity;
}
