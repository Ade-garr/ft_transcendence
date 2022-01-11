import { MessageDTO } from './dto/MessageDTO';
import { UserService } from './../user/user.service';
import { MessageEntity } from './entities/message.entity';
import { Repository } from 'typeorm';
import { MessageI } from './interfaces/message.interface';
import { RoomI } from './interfaces/room.interface';
import { UserI } from 'src/user/interfaces/user.interface';
export declare class MessageService {
    private readonly messageRepository;
    private readonly userService;
    constructor(messageRepository: Repository<MessageEntity>, userService: UserService);
    create(messageDTO: MessageDTO): Promise<MessageEntity>;
    findMessagesForRoom(room: RoomI): Promise<MessageI[]>;
    filteredBlockedUserFromMessages(userSent: UserI, messages: MessageI[]): Promise<any[]>;
}
