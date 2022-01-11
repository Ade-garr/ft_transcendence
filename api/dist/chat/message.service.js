"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const user_service_1 = require("./../user/user.service");
const message_entity_1 = require("./entities/message.entity");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_interface_1 = require("../user/interfaces/user.interface");
let MessageService = class MessageService {
    constructor(messageRepository, userService) {
        this.messageRepository = messageRepository;
        this.userService = userService;
    }
    async create(messageDTO) {
        return await this.messageRepository.save(this.messageRepository.create(messageDTO));
    }
    async findMessagesForRoom(room) {
        const query = this.messageRepository
            .createQueryBuilder('message')
            .leftJoin('message.room', 'room')
            .where('room.id = :roomId', { roomId: room.id })
            .leftJoinAndSelect('message.user', 'user')
            .orderBy('message.created_at', 'DESC');
        return query.getMany();
    }
    async filteredBlockedUserFromMessages(userSent, messages) {
        const user = await this.userService.findOneById(userSent.id);
        const filtredMessages = [];
        for (const message of messages) {
            if (user.blocked.find(element => element == message.user.id) != -1) {
                filtredMessages.push(message);
            }
        }
        return filtredMessages;
    }
};
MessageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.MessageEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        user_service_1.UserService])
], MessageService);
exports.MessageService = MessageService;
//# sourceMappingURL=message.service.js.map