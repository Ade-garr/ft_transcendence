import { UserEntity } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ConnectedPlayerEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	socketId: string;

	@ManyToOne(() => UserEntity, user => user.game_connections, { onDelete: 'CASCADE'})
	@JoinColumn()
	user: UserEntity;
}