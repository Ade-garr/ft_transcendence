import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsString, Length } from 'class-validator';
import { UserEntity } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { RoomEntity } from "./room.entity";

@Entity()
export class MessageEntity {

    @ApiProperty()
    @PrimaryGeneratedColumn()
    @Exclude()
    id: number;

    @ApiProperty()
    @ManyToOne(() => UserEntity, user => user.messages, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: UserEntity;

    @ApiProperty()
    @ManyToOne(() => RoomEntity, room => room.messages, { onDelete: 'CASCADE' })
    @JoinTable()
    room: RoomEntity;

    @ApiProperty()
    @IsString()
    @Length(1, 150)
    @Column()
    content: string;

    @ApiProperty()
    @CreateDateColumn()
    @Exclude()
    created_at: Date;

    @ApiProperty()
    @Column()
    game: number;

    @ApiProperty()
    @Column()
    challenger: number;
}