import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { UserEntity } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class JoinedGameEntity {
	@ApiProperty()
	@PrimaryGeneratedColumn()
	@IsNumber()
	id: number;

	@ApiProperty()
	@IsString()
	@Column()
	socketId: string;

	@ApiProperty()
	@ManyToOne(() => UserEntity, user => user.joinedGames, { onDelete: 'CASCADE'})
	@JoinColumn()
	user: UserEntity;

	@ApiProperty()
	@Column()
	@IsNumber()
	gameId: number;
}