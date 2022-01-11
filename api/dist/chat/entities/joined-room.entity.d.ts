import { RoomEntity } from './room.entity';
import { UserEntity } from 'src/user/entities/user.entity';
export declare class JoinedRoomEntity {
    id: number;
    socketId: string;
    user: UserEntity;
    room: RoomEntity;
}
