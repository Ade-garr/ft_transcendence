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
exports.JoinedRoomService = void 0;
const user_service_1 = require("./../user/user.service");
const joined_room_entity_1 = require("./entities/joined-room.entity");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let JoinedRoomService = class JoinedRoomService {
    constructor(joinedRoomRepository, userService) {
        this.joinedRoomRepository = joinedRoomRepository;
        this.userService = userService;
    }
    async create(joinedRoom) {
        return this.joinedRoomRepository.save(joinedRoom);
    }
    async findByUser(user) {
        return this.joinedRoomRepository.find({ user });
    }
    async findByRoom(room) {
        return this.joinedRoomRepository
            .createQueryBuilder('joined_room_entity')
            .leftJoin('joined_room_entity.room', 'room')
            .where('room.id = :roomId', { roomId: room.id })
            .getMany();
    }
    async deleteBySocketId(socketId) {
        return await this.joinedRoomRepository.delete({ socketId });
    }
    async removeUserFromRoomId(user, room) {
        const userId = user.id;
        const roomId = room.id;
        await this.joinedRoomRepository
            .createQueryBuilder('joined_room_entity')
            .leftJoin('joined_room_entity.room', 'room')
            .where('room.id = :roomId', { roomId })
            .leftJoin('joined_room_entity.user', 'user')
            .andWhere('user.id = :userId', { userId })
            .delete()
            .execute();
    }
    async disconnectAllInRoom(roomId) {
        this.joinedRoomRepository
            .createQueryBuilder('joined_room_entity')
            .leftJoin('joined_room_entity.room', 'room')
            .where('room.id = :roomId', { roomId })
            .delete()
            .execute();
    }
    async deleteAll() {
        await this.joinedRoomRepository
            .createQueryBuilder()
            .delete()
            .execute();
    }
};
JoinedRoomService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(joined_room_entity_1.JoinedRoomEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        user_service_1.UserService])
], JoinedRoomService);
exports.JoinedRoomService = JoinedRoomService;
//# sourceMappingURL=joined-room.service.js.map