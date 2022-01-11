import { MessageEntity } from './../../chat/entities/message.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ConnectedUserEntity } from 'src/chat/entities/connected-user.entity';
import { RoomEntity } from 'src/chat/entities/room.entity';
import { Entity,
    Column,
    Unique,
    PrimaryColumn,
    CreateDateColumn,
    ManyToMany,
    OneToMany, 
    JoinTable,
}
from 'typeorm';
import { JoinedRoomEntity } from 'src/chat/entities/joined-room.entity';
import { GameEntity } from 'src/game/entities/game.entity';
import { JoinedGameEntity } from 'src/game/entities/joined-game.entity';

export enum UserStatus {
    ONLINE = "online",
    OFFLINE = "offline",
    INGAME = "in a game"
}

@Entity()
@Unique(['username'])
export class UserEntity {

    @ApiProperty()
    @PrimaryColumn()
    id: number;

    @ApiProperty()
    @Column({unique: true})
    username: string;

    @ApiProperty()
    @Column({default: null})
    avatar?: string;

    @ApiProperty()
    @Column({ default: false })
    is_admin: boolean;

    @ApiProperty()
    @Column({
        type: "enum",
        enum: UserStatus,
        default: UserStatus.OFFLINE
    })
    status?: UserStatus;

    @ApiProperty()
    @Column("simple-array")
    friends: number[];

    @ApiProperty()
    @Column("simple-array")
    blocked: number[];

    @ApiProperty()
    @Column({ default: false})
    twoFA: boolean;

    @ApiProperty()
    @Column({ default: null })
    secret: string;

    @ApiProperty()
    @Column({ default: null })
    tmp_secret: string;

    @ApiProperty()
    @CreateDateColumn()
    created_at: Date;

    @ApiProperty()
    @ManyToMany(() => RoomEntity, room => room.users)
    rooms: RoomEntity[];

    @ApiProperty()
    @OneToMany(() => JoinedRoomEntity, joinedRoom => joinedRoom.room)
    joinedRooms: JoinedRoomEntity[];

    @ApiProperty()
    @OneToMany(() => ConnectedUserEntity, connection => connection.user)
    connections: ConnectedUserEntity[];

    @ApiProperty()
    @OneToMany(() => MessageEntity, message => message.user)
    messages: MessageEntity[];

    @ApiProperty()
    @ManyToMany(() => GameEntity)
	@JoinTable()
	games: GameEntity[];

    @ApiProperty()
	@Column({default: 0})
	victories: number;

    @ApiProperty()
	@Column({default: 0})
	losses: number;

    @ApiProperty()
    @Column({ type: "simple-array"})
    achievements: number[];

    @ApiProperty()
    @OneToMany(() => JoinedGameEntity, joinedGame => joinedGame.user) //gameId
    joinedGames: JoinedGameEntity[];

    @ApiProperty()
    @OneToMany(() => ConnectedUserEntity, game_connection => game_connection.user)
    game_connections: ConnectedUserEntity[];

}
