import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class BannedEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	banId: number;
}