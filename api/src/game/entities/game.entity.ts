import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class GameEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	player1: number;

	@Column()
	player2: number;

	@Column({ default: 0})
	score1: number;

	@Column({ default: 0})
	score2: number;

	@CreateDateColumn()
	created_at: Date;
}