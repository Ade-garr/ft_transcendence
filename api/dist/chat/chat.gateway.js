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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const roles_guard_1 = require("./../auth/roles.guard");
const createRoomDTO_1 = require("./dto/createRoomDTO");
const RoomUserDTO_1 = require("./dto/RoomUserDTO");
const MuteUserDTO_1 = require("./dto/MuteUserDTO");
const MessageDTO_1 = require("./dto/MessageDTO");
const admin_guard_1 = require("./guard/admin.guard");
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const joined_room_service_1 = require("./joined-room.service");
const message_service_1 = require("./message.service");
const connected_user_service_1 = require("./connected-user.service");
const room_service_1 = require("./room.service");
const user_service_1 = require("../user/user.service");
const auth_service_1 = require("./../auth/auth.service");
const socket_io_1 = require("socket.io");
const cookie_1 = require("cookie");
const room_entity_1 = require("./entities/room.entity");
const jwt_cookie_guard_1 = require("./guard/jwt-cookie.guard");
const owner_guard_1 = require("./guard/owner.guard");
const UpdateAdminDTO_1 = require("./dto/UpdateAdminDTO");
let ChatGateway = class ChatGateway {
    constructor(authService, userService, roomService, connectedUserService, messageService, joinedRoomService) {
        this.authService = authService;
        this.userService = userService;
        this.roomService = roomService;
        this.connectedUserService = connectedUserService;
        this.messageService = messageService;
        this.joinedRoomService = joinedRoomService;
    }
    async onModuleInit() {
        await this.connectedUserService.deleteAll();
        await this.joinedRoomService.deleteAll();
    }
    async handleConnection(socket) {
        try {
            const { access_token: token } = (0, cookie_1.parse)(socket.handshake.headers.cookie);
            const decodedToken = await this.authService.verifyJwt(token);
            if (!decodedToken) {
                throw new common_1.UnauthorizedException();
            }
            const user = await this.userService.findOneById(decodedToken.id);
            if (!user) {
                return this.disconnect(socket);
            }
            else {
                socket.data.user = user;
                const rooms = await this.roomService.getRoomsForUser(user.id);
                await this.connectedUserService.create({ socketId: socket.id, user });
                return this.server.to(socket.id).emit('rooms', rooms);
            }
        }
        catch (error) {
            return this.disconnect(socket);
        }
    }
    async handleDisconnect(socket) {
        await this.connectedUserService.deleteBySocketId(socket.id);
        socket.disconnect();
    }
    async onCreateRoom(socket, createRoom) {
        const createdRoom = await this.roomService.createRoom(createRoom, socket.data.user);
        const room = await this.roomService.getRoomWithUser(createdRoom.id);
        console.log(room);
        for (const user of room.users) {
            const connections = await this.connectedUserService.findByUser(user);
            const rooms = await this.roomService.getRoomsForUser(user.id);
            for (const connection of connections) {
                this.server.to(connection.socketId).emit('rooms', rooms);
            }
        }
    }
    async onChangePassword(socket, room) {
        if (room.status == room_entity_1.RoomStatus.PRIVATE)
            return;
        await this.roomService.changePassword(room);
        console.log(room);
        for (const user of room.users) {
            const connections = await this.connectedUserService.findByUser(user);
            const rooms = await this.roomService.getRoomsForUser(user.id);
            for (const connection of connections) {
                this.server.to(connection.socketId).emit('rooms', rooms);
            }
        }
    }
    async inviteToPrivateRoom(socket, inviteUser) {
        await this.roomService.inviteToPrivateRoom(inviteUser.room, inviteUser.userId);
        const user = await this.userService.findOneById(inviteUser.userId);
        const rooms = await this.roomService.getRoomsForUser(user.id);
        const connections = await this.connectedUserService.findByUser(user);
        for (const connection of connections) {
            this.server.to(connection.socketId).emit('rooms', rooms);
        }
    }
    async onJoinRoom(socket, room) {
        const user = await this.userService.findOneById(socket.data.user.id);
        await this.roomService.onJoinRoom(room, user);
        const messages = await this.messageService.findMessagesForRoom(room);
        console.log(messages);
        await this.joinedRoomService.create({ socketId: socket.id, user: socket.data.user, room });
        this.server.to(socket.id).emit('messages', messages);
        const eroom = await this.roomService.getRoomWithUser(room.id);
        for (const user of eroom.users) {
            const connectedUser = await this.connectedUserService.findByUser(user);
            for (const connected of connectedUser) {
                this.server.to(connected.socketId).emit('room', eroom);
            }
        }
    }
    async onBanRoom(socket, banUser) {
        const user = await this.userService.findOneById(banUser.userId);
        if (!user)
            throw new common_1.UnprocessableEntityException();
        await this.roomService.banUserFromRoom(socket.data.user.id, banUser.userId, banUser.room);
        await this.joinedRoomService.removeUserFromRoomId(user, banUser.room);
        const connections = await this.connectedUserService.findByUser(user);
        const rooms = await this.roomService.getRoomsForUser(user.id);
        for (const connection of connections) {
            this.server.to(connection.socketId).emit('rooms', rooms);
        }
    }
    async onunBanRoom(socket, unbanUser) {
        const user = await this.userService.findOneById(unbanUser.userId);
        console.log('i am going to un ban ', unbanUser.userId, 'from ', unbanUser.room);
        if (!user) {
            throw new common_1.UnprocessableEntityException();
        }
        await this.roomService.unbanUserFromRoom(unbanUser.userId, unbanUser.room.id);
        const connections = await this.connectedUserService.findByUser(user);
        const rooms = await this.roomService.getRoomsForUser(user.id);
        for (const connection of connections) {
            this.server.to(connection.socketId).emit('rooms', rooms);
        }
    }
    async onMuteUser(socket, muteUser) {
        const user = await this.userService.findOneById(socket.data.user.id);
        if (!user) {
            throw new common_1.UnprocessableEntityException();
        }
        await this.roomService.onMuteUser(muteUser, user.id);
    }
    async onLeaveRoom(socket) {
        await this.joinedRoomService.deleteBySocketId(socket.id);
    }
    async onUnjoinRoom(socket, room) {
        await this.roomService.onUnjoinRoom(room.id, socket.data.user.id);
        const connections = await this.connectedUserService.findAll();
        for (const connection of connections) {
            const rooms = await this.roomService.getRoomsForUser(connection.user.id);
            this.server.to(connection.socketId).emit('rooms', rooms);
        }
    }
    async onAddMessage(socket, message) {
        if (!message.room) {
            throw new common_1.HttpException('this room does not exist', common_1.HttpStatus.NOT_FOUND);
        }
        const room = await this.roomService.getRoom(message.room.id);
        const user = await this.userService.findOneById(socket.data.user.id);
        const muteIndex = room.mutes.findIndex(element => element.userId == user.id);
        if (muteIndex != -1) {
            if (Date.now() < parseInt(room.mutes[muteIndex].time)) {
                throw new common_1.UnauthorizedException();
            }
            else {
                room.mutes.splice(muteIndex, 1);
                await this.roomService.save(room);
            }
        }
        else if (room.bans.find(element => element == user.id)) {
            throw new common_1.UnauthorizedException();
        }
        const createdMessage = await this.messageService.create(message);
        console.log(createdMessage);
        const joinedUsers = await this.joinedRoomService.findByRoom(room);
        for (const user of joinedUsers) {
            this.server.to(user.socketId).emit('messageAdded', createdMessage);
        }
    }
    async onDeleteRoom(socket, roomId) {
        await this.roomService.onDeleteRoom(roomId);
        const connections = await this.connectedUserService.findAll();
        for (const connection of connections) {
            const rooms = await this.roomService.getRoomsForUser(connection.user.id);
            this.server.to(connection.socketId).emit('rooms', rooms);
        }
    }
    disconnect(socket) {
        socket.emit('Error', new common_1.UnauthorizedException());
        socket.disconnect();
    }
    async onUpdateAdmin(socket, updateAdmin) {
        console.log(updateAdmin);
        const roomToUpdate = await this.roomService.getRoomWithUser(updateAdmin.roomId);
        if (roomToUpdate.users.findIndex(element => element.id == updateAdmin.userId) == -1)
            throw new common_1.UnprocessableEntityException();
        await this.roomService.updateUserAdminStatus(updateAdmin.userId, roomToUpdate);
        for (const user of roomToUpdate.users) {
            const connections = await this.connectedUserService.findByUser(user);
            const rooms = await this.roomService.getRoomsForUser(user.id);
            for (const connection of connections) {
                this.server.to(connection.socketId).emit('rooms', rooms);
            }
        }
    }
    async getAllRooms() {
        return await this.roomService.getAllRooms();
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie),
    (0, websockets_1.SubscribeMessage)('createRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, createRoomDTO_1.createRoomDTO]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onCreateRoom", null);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie, owner_guard_1.OwnerGuard),
    (0, websockets_1.SubscribeMessage)('changePassword'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onChangePassword", null);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie, owner_guard_1.OwnerGuard),
    (0, websockets_1.SubscribeMessage)('inviteToPrivateRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, RoomUserDTO_1.RoomUserDTO]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "inviteToPrivateRoom", null);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie),
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onJoinRoom", null);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie, admin_guard_1.AdminGuard),
    (0, websockets_1.SubscribeMessage)('banUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, RoomUserDTO_1.RoomUserDTO]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onBanRoom", null);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie, admin_guard_1.AdminGuard),
    (0, websockets_1.SubscribeMessage)('unbanRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, RoomUserDTO_1.RoomUserDTO]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onunBanRoom", null);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie, admin_guard_1.AdminGuard),
    (0, websockets_1.SubscribeMessage)('muteUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, MuteUserDTO_1.MuteUserDTO]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onMuteUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie),
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onLeaveRoom", null);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie),
    (0, websockets_1.SubscribeMessage)('unjoinRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onUnjoinRoom", null);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie),
    (0, websockets_1.SubscribeMessage)('addMessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, MessageDTO_1.MessageDTO]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onAddMessage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie),
    (0, websockets_1.SubscribeMessage)('deleteRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onDeleteRoom", null);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie),
    (0, websockets_1.SubscribeMessage)('updateAdmin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, UpdateAdminDTO_1.UpdateAdminDTO]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onUpdateAdmin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie, roles_guard_1.RolesGuard),
    (0, websockets_1.SubscribeMessage)('getAllRooms'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "getAllRooms", null);
ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: "/chat", cors: { origin: true, credentials: true } }),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService,
        room_service_1.RoomService,
        connected_user_service_1.ConnectedUserService,
        message_service_1.MessageService,
        joined_room_service_1.JoinedRoomService])
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map