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
exports.RoomService = void 0;
const mute_service_1 = require("./mute.service");
const user_entity_1 = require("../user/entities/user.entity");
const joined_room_service_1 = require("./joined-room.service");
const user_service_1 = require("./../user/user.service");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const room_entity_1 = require("./entities/room.entity");
const bcrypt = require("bcrypt");
const user_interface_1 = require("../user/interfaces/user.interface");
let RoomService = class RoomService {
    constructor(roomRepository, muteService, userService, joinedRoomService) {
        this.roomRepository = roomRepository;
        this.muteService = muteService;
        this.userService = userService;
        this.joinedRoomService = joinedRoomService;
    }
    async createRoom(createRoom, creator) {
        const user = await this.userService.findOneById(creator.id);
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        const newRoom = this.roomRepository.create({
            title: createRoom.title,
            messages: [],
            joinedUsers: [],
            users: [user],
            status: createRoom.status,
            password: createRoom.password,
            owner: creator.id,
            admins: [creator.id],
            bans: [],
            mutes: [],
        });
        if (newRoom.status === room_entity_1.RoomStatus.PROTECTED) {
            const hashedPassword = await bcrypt.hash(createRoom.password, 12);
            if (!hashedPassword) {
                throw new common_1.InternalServerErrorException();
            }
            else {
                newRoom.password = hashedPassword;
            }
        }
        if (newRoom.status !== room_entity_1.RoomStatus.PRIVATE) {
            const users = await this.userService.findAll();
            for (const userToAdd of users) {
                if (userToAdd.id != user.id)
                    newRoom.users.push(userToAdd);
            }
        }
        return await this.roomRepository.save(newRoom);
    }
    async getRoom(roomId) {
        return await this.roomRepository
            .createQueryBuilder('room')
            .where('room.id = :roomId', { roomId })
            .leftJoinAndSelect('room.mutes', 'all_mutes')
            .getOne();
    }
    async validatePassword(roomToJoin, roomSent) {
        try {
            const valid = await bcrypt.compare(roomSent.password, roomToJoin.password);
            if (!valid) {
                throw new common_1.UnauthorizedException();
            }
        }
        catch (error) {
            throw new common_1.UnauthorizedException();
        }
    }
    async verifyUser(room, user) {
        try {
            if (!room.users.find(element => element.id == user.id)) {
                throw new common_1.UnauthorizedException();
            }
        }
        catch (error) {
            throw new common_1.UnauthorizedException();
        }
    }
    async onJoinRoom(roomSent, user) {
        const roomToJoin = await this.roomRepository
            .createQueryBuilder('room')
            .where('room.id = :roomId', { roomId: roomSent.id })
            .leftJoinAndSelect('room.users', 'all_users')
            .getOne();
        if (!roomToJoin || roomToJoin.bans.find(element => element == user.id)) {
            throw new common_1.UnauthorizedException();
        }
        else if (roomToJoin.status !== room_entity_1.RoomStatus.PUBLIC) {
            if (roomToJoin.status === room_entity_1.RoomStatus.PRIVATE) {
                await this.verifyUser(roomToJoin, user);
            }
            else if (roomToJoin.status === room_entity_1.RoomStatus.PROTECTED) {
                await this.validatePassword(roomToJoin, roomSent);
            }
            else {
                throw new common_1.UnauthorizedException();
            }
        }
        if (!roomToJoin.users.find(element => element == user)) {
            roomToJoin.users.push(user);
            await this.roomRepository.save(roomToJoin);
        }
    }
    async changePassword(room) {
        const newRoom = await this.getRoom(room.id);
        if (room.password == '' || room.password == undefined) {
            console.log('password', room.password);
            newRoom.password == '';
            newRoom.status = room_entity_1.RoomStatus.PUBLIC;
        }
        else {
            const hashedPassword = await bcrypt.hash(room.password, 12);
            if (!hashedPassword) {
                throw new common_1.InternalServerErrorException();
            }
            else
                newRoom.password = hashedPassword;
            newRoom.status = room_entity_1.RoomStatus.PROTECTED;
        }
        await this.roomRepository.save(newRoom);
    }
    async inviteToPrivateRoom(roomSent, userId) {
        try {
            const roomId = roomSent.id;
            const user = await this.userService.findOneById(userId);
            const room = await this.roomRepository
                .createQueryBuilder('room')
                .where('room.id = :roomId', { roomId })
                .leftJoinAndSelect('room.users', 'all_users')
                .getOne();
            console.log('room in invite', room);
            if (!room || room.status != room_entity_1.RoomStatus.PRIVATE) {
                throw new common_1.NotFoundException();
            }
            if (!room.users.find(element => element == user)) {
                room.users.push(user);
                await this.roomRepository.save(room);
            }
        }
        catch (error) {
            console.log(error);
            throw new common_1.UnauthorizedException();
        }
    }
    async getRoomsForUser(userId) {
        const queryAllPublicAndProtectedRooms = this.roomRepository
            .createQueryBuilder('room')
            .where('room.status != :privateStatus', { privateStatus: room_entity_1.RoomStatus.PRIVATE })
            .leftJoinAndSelect('room.users', 'all_users')
            .orderBy('room.updated_at', 'DESC');
        const queryUserPrivateRooms = this.roomRepository
            .createQueryBuilder('room')
            .leftJoin('room.users', 'users')
            .where('users.id = :userId', { userId })
            .andWhere('room.status = :privateStatus', { privateStatus: room_entity_1.RoomStatus.PRIVATE })
            .leftJoinAndSelect('room.users', 'all_users')
            .orderBy('room.updated_at', 'DESC');
        const allPubRooms = await queryAllPublicAndProtectedRooms.getMany();
        const userPrivateRooms = await queryUserPrivateRooms.getMany();
        const allRooms = allPubRooms.concat(userPrivateRooms);
        const filteredRooms = [];
        for (const room of allRooms) {
            const isBan = room.bans.findIndex(element => element == userId);
            if (isBan == -1) {
                filteredRooms.push(room);
            }
        }
        return filteredRooms;
    }
    async banUserFromRoom(userId, idToBan, roomSent) {
        const room = await this.getRoomWithUser(roomSent.id);
        if (room) {
            const userIndex = room.users.findIndex(element => element.id == idToBan);
            if (userIndex != -1) {
                if (room.admins.find(element => element == idToBan) && userId != room.owner) {
                    throw new common_1.UnauthorizedException();
                }
                room.users.splice(userIndex, 1);
                if (room.bans.findIndex(element => element == idToBan) == -1)
                    room.bans.push(idToBan);
                this.roomRepository.save(room);
            }
            await this.roomRepository.save(room);
        }
    }
    async unbanUserFromRoom(idToUnBan, roomId) {
        const roomWithUsers = await this.getRoomWithUser(roomId);
        if (roomWithUsers) {
            let userIndex = roomWithUsers.bans.findIndex(element => element == idToUnBan);
            if (userIndex != -1) {
                roomWithUsers.bans.splice(userIndex, 1);
            }
            const user = await this.userService.findOneById(idToUnBan);
            userIndex = roomWithUsers.users.findIndex(element => element == user);
            if (userIndex == -1)
                roomWithUsers.users.push(user);
            await this.roomRepository.save(roomWithUsers);
            console.log(roomWithUsers);
        }
    }
    async onDeleteRoom(roomId) {
        const roomToDelete = await this.roomRepository.findOne({ id: roomId });
        if (roomToDelete) {
            console.log('delete room ', roomToDelete);
            try {
                await this.joinedRoomService.disconnectAllInRoom(roomToDelete.id);
                await this.roomRepository.delete({ id: roomToDelete.id });
            }
            catch (error) {
                console.log(error);
                throw new common_1.InternalServerErrorException();
            }
        }
    }
    async getRoomWithUser(roomId) {
        return await this.roomRepository
            .createQueryBuilder('room')
            .where('room.id = :roomId', { roomId })
            .leftJoinAndSelect('room.users', 'all_users')
            .getOne();
    }
    async onUnjoinRoom(roomId, userId) {
        const room = await this.getRoomWithUser(roomId);
        if (!room) {
            throw new common_1.UnauthorizedException();
        }
        const userIndex = room.users.findIndex(element => element.id == userId);
        if (userIndex != -1) {
            const adminIndex = room.admins.findIndex(element => element == userId);
            if (adminIndex != -1)
                await this.updateUserAdminStatus(userId, room);
            console.log(room.owner);
            console.log(userId);
            if (room.owner == userId) {
                if (room.admins.length > 0) {
                    room.owner = room.admins[0];
                }
                else
                    return await this.onDeleteRoom(room.id);
            }
            room.users.splice(userIndex, 1);
            await this.roomRepository.save(room);
        }
    }
    async save(room) {
        await this.roomRepository.save(room);
    }
    async updateUserAdminStatus(userId, roomToUpdate) {
        try {
            let index;
            if ((index = roomToUpdate.admins.findIndex(element => element == userId)) != -1) {
                roomToUpdate.admins.splice(index, 1);
            }
            else
                roomToUpdate.admins.push(userId);
            await this.roomRepository.save(roomToUpdate);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException();
        }
    }
    async onMuteUser(muteUser, userId) {
        const roomId = muteUser.room.id;
        const room = await this.roomRepository
            .createQueryBuilder('room')
            .where('room.id = :roomId', { roomId })
            .leftJoinAndSelect('room.mutes', 'mutes')
            .getOne();
        if (room.admins.find(element => element == muteUser.id) && userId != room.owner) {
            throw new common_1.UnauthorizedException();
        }
        const muteIndex = room.mutes.findIndex(element => element.userId == userId);
        if (muteIndex != -1)
            room.mutes.splice(muteIndex, 1);
        let now = new Date();
        var endOfSanction = new Date(now.getTime() + muteUser.duration * 60000);
        const newMute = await this.muteService.create(muteUser.id, endOfSanction.getTime().toString(), room);
        room.mutes.push(newMute);
        await this.roomRepository.save(room);
        console.log(room);
    }
    async getAllRooms() {
        return await this.roomRepository
            .createQueryBuilder('room_entity')
            .getMany();
    }
};
RoomService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(room_entity_1.RoomEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        mute_service_1.MuteService,
        user_service_1.UserService,
        joined_room_service_1.JoinedRoomService])
], RoomService);
exports.RoomService = RoomService;
//# sourceMappingURL=room.service.js.map