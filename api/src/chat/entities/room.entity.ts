import { ApiProperty } from '@nestjs/swagger';
import { MuteEntity } from './mute.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { JoinedRoomEntity } from './joined-room.entity';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, MustBeEntityError, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MessageEntity } from "./message.entity";
import { IsString, Length } from 'class-validator';
import { Exclude } from 'class-transformer';

export enum RoomStatus {
    PUBLIC = "public",
    PRIVATE = "private",
    PROTECTED = "protected"
}

@Entity('room')
export class RoomEntity {

	@ApiProperty()
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty()
	@IsString()
	@Length(1, 30)
	@Column()
	title: string;

	@ApiProperty()
	@OneToMany(() => MessageEntity, message => message.room, { cascade: true })
	messages: MessageEntity[];

	@ApiProperty()
	@Exclude()
	@OneToMany(() => JoinedRoomEntity, joinedRoom => joinedRoom.room, { cascade: true })
	joinedUsers: JoinedRoomEntity[];

	@ApiProperty()
	@ManyToMany(() => UserEntity, { onDelete: 'CASCADE'})
	@JoinTable()
	users: UserEntity[];

	@ApiProperty()
	@Column({
		type: "enum",
		enum: RoomStatus,
		default: RoomStatus.PUBLIC,
	})
	status: RoomStatus;

	@ApiProperty()
	@Exclude()
	//TODO: password check
	@Column({nullable: true, default: null})
	password: string;

	@ApiProperty()
	@Exclude()
	@CreateDateColumn()
	created_at: Date;

	@ApiProperty()
	@Exclude()
	@UpdateDateColumn()
	updated_at: Date;
	
	@ApiProperty()
	@Column({ nullable: false})
	owner: number;

	@ApiProperty()
	@Column("simple-array", { default: [] })
	admins: number[];

	@ApiProperty()
	@Column("simple-array", { default: [] })
	bans: number[];

	@ApiProperty()
	@OneToMany(() => MuteEntity, mutes => mutes.room, { cascade: true })
	mutes: MuteEntity[]
}