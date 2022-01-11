import { UserEntity } from 'src/user/entities/user.entity';
export declare class ConnectedPlayerEntity {
    id: number;
    socketId: string;
    user: UserEntity;
}
