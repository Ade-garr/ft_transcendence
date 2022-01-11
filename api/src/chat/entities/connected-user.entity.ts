import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { UserEntity } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ConnectedUserEntity {

	@ApiProperty()
	@PrimaryGeneratedColumn() 
	id: number;

	@ApiProperty()
	@IsString()
	@Column()
	socketId: string;

	@ApiProperty()
	@ManyToOne(() => UserEntity, user => user.connections, { onDelete: 'CASCADE'})
	@JoinColumn()
	user: UserEntity;
}