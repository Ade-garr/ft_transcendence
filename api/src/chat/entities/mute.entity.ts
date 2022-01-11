import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Length } from 'class-validator';
import { RoomEntity } from 'src/chat/entities/room.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";

@Entity()
export class MuteEntity {
	@ApiProperty()
	@PrimaryGeneratedColumn()
	id: number;
	
	@ApiProperty()
	@Column()
	@IsString()
	@Length(1, 20)
	time: string;

	@ApiProperty()
	@Column()
	@IsNumber()
	userId: number;

	@ApiProperty()
	@ManyToOne(() => RoomEntity, room => room.mutes, { onDelete: 'CASCADE'})
	@JoinColumn()
	room: RoomEntity;
}