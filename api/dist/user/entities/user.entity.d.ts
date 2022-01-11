import { MessageEntity } from './../../chat/entities/message.entity';
import { ConnectedUserEntity } from 'src/chat/entities/connected-user.entity';
import { RoomEntity } from 'src/chat/entities/room.entity';
import { JoinedRoomEntity } from 'src/chat/entities/joined-room.entity';
import { GameEntity } from 'src/game/entities/game.entity';
import { JoinedGameEntity } from 'src/game/entities/joined-game.entity';
export declare enum UserStatus {
    ONLINE = "online",
    OFFLINE = "offline",
    INGAME = "in a game"
}
export declare class UserEntity {
    id: number;
    username: string;
    avatar?: string;
    is_admin: boolean;
    status?: UserStatus;
    friends: number[];
    blocked: number[];
    twoFA: boolean;
    secret: string;
    tmp_secret: string;
    created_at: Date;
    rooms: RoomEntity[];
    joinedRooms: JoinedRoomEntity[];
    connections: ConnectedUserEntity[];
    messages: MessageEntity[];
    games: GameEntity[];
    victories: number;
    losses: number;
    achievements: number[];
    joinedGames: JoinedGameEntity[];
    game_connections: ConnectedUserEntity[];
}
