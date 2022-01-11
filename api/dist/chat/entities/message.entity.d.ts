import { UserEntity } from 'src/user/entities/user.entity';
import { RoomEntity } from "./room.entity";
export declare class MessageEntity {
    id: number;
    user: UserEntity;
    room: RoomEntity;
    content: string;
    created_at: Date;
    game: number;
    challenger: number;
}
