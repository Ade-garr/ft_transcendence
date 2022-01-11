import { MuteEntity } from './mute.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { JoinedRoomEntity } from './joined-room.entity';
import { MessageEntity } from "./message.entity";
export declare enum RoomStatus {
    PUBLIC = "public",
    PRIVATE = "private",
    PROTECTED = "protected"
}
export declare class RoomEntity {
    id: number;
    title: string;
    messages: MessageEntity[];
    joinedUsers: JoinedRoomEntity[];
    users: UserEntity[];
    status: RoomStatus;
    password: string;
    created_at: Date;
    updated_at: Date;
    owner: number;
    admins: number[];
    bans: number[];
    mutes: MuteEntity[];
}
