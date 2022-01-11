import { RoomEntity } from './room.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

@Entity()
export class JoinedRoomEntity {

	@ApiProperty()
	@PrimaryGeneratedColumn()
	@IsNumber()
	id: number;

	@ApiProperty()
	@IsString()
	@Column()
	socketId: string;

	@ApiProperty()
	@ManyToOne(() => UserEntity, user => user.joinedRooms, { onDelete:'CASCADE' })
	@JoinColumn()
	user: UserEntity;

	@ApiProperty()
	@ManyToOne(() => RoomEntity, room => room.joinedUsers, { onDelete:'CASCADE' })
	@JoinColumn()
	room: RoomEntity;
}