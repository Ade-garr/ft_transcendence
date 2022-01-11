import { MessageDTO } from './dto/MessageDTO';
import { UserService } from './../user/user.service';
import { MessageEntity } from './entities/message.entity';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { MessageI } from './interfaces/message.interface';
import { RoomI } from './interfaces/room.interface';
import { UserI } from 'src/user/interfaces/user.interface';

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(MessageEntity)
		private readonly messageRepository: Repository<MessageEntity>,
		private readonly userService: UserService,
	) {}

	async create(messageDTO: MessageDTO): Promise<MessageEntity> {
		return await this.messageRepository.save(this.messageRepository.create(messageDTO));
	}

	async findMessagesForRoom(room: RoomI): Promise<MessageI[]> {
		const query = this.messageRepository
		.createQueryBuilder('message')
		.leftJoin('message.room', 'room')
		.where('room.id = :roomId', {roomId: room.id})
		.leftJoinAndSelect('message.user', 'user')
		.orderBy('message.created_at', 'DESC');
		return query.getMany();
	}

	async filteredBlockedUserFromMessages(userSent: UserI, messages: MessageI[]) {
		const user = await this.userService.findOneById(userSent.id);
		const filtredMessages = [];
		for (const message of messages) {
			if (user.blocked.find(element => element == message.user.id ) != -1) {
				filtredMessages.push(message);
			}
		}
		return filtredMessages;
	}
}