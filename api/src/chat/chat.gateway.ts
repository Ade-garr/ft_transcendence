import { RolesGuard } from './../auth/roles.guard';
import { createRoomDTO } from './dto/createRoomDTO';
import { RoomUserDTO } from './dto/RoomUserDTO';
import { MuteUserDTO } from './dto/MuteUserDTO';
import { MessageDTO } from './dto/MessageDTO';
import { AdminGuard } from './guard/admin.guard';
import {
  HttpException,
  HttpStatus,
  OnModuleInit,
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards
} from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { JoinedRoomI } from './interfaces/joined-room.interface';
import { MessageI } from './interfaces/message.interface';
import { JoinedRoomService } from './joined-room.service';
import { MessageService } from './message.service';
import { ConnectedUserService } from './connected-user.service';
import { RoomService } from './room.service';
import { UserService } from '../user/user.service';
import { AuthService } from './../auth/auth.service';
import { Server, Socket } from "socket.io";
import { UserI } from '../user/interfaces/user.interface';
import { RoomI } from './interfaces/room.interface';
import { ConnectedUserI } from './interfaces/connected-user.interface';
import { parse } from 'cookie';
import { RoomEntity, RoomStatus } from './entities/room.entity';
import { JwtSocketCookie } from "./guard/jwt-cookie.guard";
import { OwnerGuard } from "./guard/owner.guard";
import { UpdateAdminDTO } from './dto/UpdateAdminDTO';


@WebSocketGateway({ namespace: "/chat", cors: { origin: true, credentials: true }})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {

  @WebSocketServer() server: Server;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private roomService: RoomService,
    private connectedUserService: ConnectedUserService,
    private messageService: MessageService,
    private joinedRoomService: JoinedRoomService,
  ) {}

  async onModuleInit() {
    await this.connectedUserService.deleteAll();
    await this.joinedRoomService.deleteAll();
  }

  async handleConnection(socket: Socket) {
    try {
      const { access_token: token} = parse(socket.handshake.headers.cookie);
      const decodedToken = await this.authService.verifyJwt(token);
      if (!decodedToken) {
        throw new UnauthorizedException();
      }
      const user: UserI = await this.userService.findOneById(decodedToken.id);
      if (!user) {
        return this.disconnect(socket); 
      } else { 
        socket.data.user = user;
        const rooms = await this.roomService.getRoomsForUser(user.id);
        await this.connectedUserService.create({ socketId: socket.id, user});
        return this.server.to(socket.id).emit('rooms', rooms);
       }
    } catch ( error ) {
      return this.disconnect(socket);
    }
  }

  async handleDisconnect( socket: Socket ) {
    await this.connectedUserService.deleteBySocketId(socket.id);
    socket.disconnect();
  }

  @UseGuards(JwtSocketCookie)
  @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, createRoom: createRoomDTO) {
    const createdRoom: RoomI = await this.roomService.createRoom(createRoom, socket.data.user);
    const room: RoomEntity = await this.roomService.getRoomWithUser(createdRoom.id);
    console.log(room);
      for (const user of room.users) {
        const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
        const rooms = await this.roomService.getRoomsForUser(user.id);
        for (const connection of connections) {
          this.server.to(connection.socketId).emit('rooms', rooms);
        }
      }
  }


  @UseGuards(JwtSocketCookie, OwnerGuard)
  @SubscribeMessage('changePassword')
  async onChangePassword(socket: Socket, room: RoomI) {
    if (room.status == RoomStatus.PRIVATE) return ;
    await this.roomService.changePassword(room);
    console.log(room);
    for (const user of room.users) {
      const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
      const rooms = await this.roomService.getRoomsForUser(user.id);
      for (const connection of connections) {
        this.server.to(connection.socketId).emit('rooms', rooms);
      }
    }
  }


  @UseGuards(JwtSocketCookie, OwnerGuard)
  @SubscribeMessage('inviteToPrivateRoom')
  async inviteToPrivateRoom(socket: Socket, inviteUser: RoomUserDTO){
    // check if user is not ban 
    await this.roomService.inviteToPrivateRoom(inviteUser.room, inviteUser.userId);
    const user = await this.userService.findOneById(inviteUser.userId);
    const rooms = await this.roomService.getRoomsForUser(user.id);
    const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
    for (const connection of connections) {
      this.server.to(connection.socketId).emit('rooms', rooms);
    }
  }

  @UseGuards(JwtSocketCookie)
  @SubscribeMessage('joinRoom')
  async onJoinRoom(socket: Socket, room: RoomI) {
    const user = await this.userService.findOneById(socket.data.user.id);
    await this.roomService.onJoinRoom(room, user);
    const messages = await this.messageService.findMessagesForRoom(room);
    console.log(messages);
    await this.joinedRoomService.create({ socketId: socket.id, user: socket.data.user, room });
    this.server.to(socket.id).emit('messages', messages);
    const eroom = await this.roomService.getRoomWithUser(room.id);
    for ( const user of eroom.users) {
      const connectedUser = await this.connectedUserService.findByUser(user);
      for (const connected of connectedUser) {
        this.server.to(connected.socketId).emit('room', eroom);
      }
    }
  }

  @UseGuards(JwtSocketCookie, AdminGuard)
  @SubscribeMessage('banUser')
  async onBanRoom(socket: Socket, banUser: RoomUserDTO) {
    const user = await this.userService.findOneById(banUser.userId);
    if ( !user) throw new UnprocessableEntityException();
    await this.roomService.banUserFromRoom(socket.data.user.id, banUser.userId, banUser.room);
    await this.joinedRoomService.removeUserFromRoomId(user, banUser.room);
    const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
    const rooms = await this.roomService.getRoomsForUser(user.id); 
    for (const connection of connections) {
      this.server.to(connection.socketId).emit('rooms', rooms);
    }
  }

  @UseGuards(JwtSocketCookie, AdminGuard)
  @SubscribeMessage('unbanRoom')
  async onunBanRoom(socket: Socket, unbanUser: RoomUserDTO) {
    const user = await this.userService.findOneById(unbanUser.userId);
    console.log( 'i am going to un ban ', unbanUser.userId, 'from ', unbanUser.room)
    if ( !user) {
      throw new UnprocessableEntityException();
    }

    await this.roomService.unbanUserFromRoom(unbanUser.userId, unbanUser.room.id );

    const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
    const rooms = await this.roomService.getRoomsForUser(user.id);
    for (const connection of connections) {
      this.server.to(connection.socketId).emit('rooms', rooms);
    }
  }

  @UseGuards(JwtSocketCookie, AdminGuard)
 @SubscribeMessage('muteUser')
 async onMuteUser(socket: Socket, muteUser: MuteUserDTO) {
  const user = await this.userService.findOneById(socket.data.user.id);
  if ( !user ) {
    throw new UnprocessableEntityException();
  }

  await this.roomService.onMuteUser(muteUser, user.id);
 }
  @UseGuards(JwtSocketCookie)
  @SubscribeMessage('leaveRoom') 
  async onLeaveRoom(socket: Socket) {
    await this.joinedRoomService.deleteBySocketId(socket.id);
  }

  @UseGuards(JwtSocketCookie)
  @SubscribeMessage('unjoinRoom')
  async onUnjoinRoom(socket: Socket, room: RoomI) {
    await this.roomService.onUnjoinRoom(room.id, socket.data.user.id);
    const connections : ConnectedUserI[] = await this.connectedUserService.findAll();
    for (const connection of connections) {
      const rooms: RoomI[] = await this.roomService.getRoomsForUser(connection.user.id);
      this.server.to(connection.socketId).emit('rooms', rooms);
    }
  }

  @UseGuards(JwtSocketCookie)
  @SubscribeMessage('addMessage')
  async onAddMessage(socket: Socket, message: MessageDTO) {
    if (!message.room) {
      throw new HttpException('this room does not exist', HttpStatus.NOT_FOUND);
    }
    const room: RoomEntity = await this.roomService.getRoom(message.room.id);
    const user = await this.userService.findOneById(socket.data.user.id);
    const muteIndex = room.mutes.findIndex( element => element.userId == user.id);
    if (muteIndex != -1) {
      if (Date.now() < parseInt(room.mutes[muteIndex].time)) {
        throw new UnauthorizedException();
      } else {
        room.mutes.splice(muteIndex, 1);
        await this.roomService.save(room);
      }
    } else if (room.bans.find( element => element == user.id)) {
      throw new UnauthorizedException();
    }
    const createdMessage: MessageI = await this.messageService.create(message);
    console.log(createdMessage);
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(room);
    for (const user of joinedUsers) {
      this.server.to(user.socketId).emit('messageAdded', createdMessage);
    }
  }

  @UseGuards(JwtSocketCookie)
  @SubscribeMessage('deleteRoom')
  async onDeleteRoom(socket: Socket, roomId: number) {
    await this.roomService.onDeleteRoom(roomId);
    const connections : ConnectedUserI[] = await this.connectedUserService.findAll();
    for (const connection of connections) {
      const rooms: RoomI[] = await this.roomService.getRoomsForUser(connection.user.id);
      this.server.to(connection.socketId).emit('rooms', rooms);
    }
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  @UseGuards(JwtSocketCookie)
  @SubscribeMessage('updateAdmin')
  async onUpdateAdmin(socket: Socket, updateAdmin: UpdateAdminDTO ) {
    console.log(updateAdmin)
  const roomToUpdate = await this.roomService.getRoomWithUser(updateAdmin.roomId);
  if (roomToUpdate.users.findIndex(element => element.id == updateAdmin.userId ) == -1)
      throw new UnprocessableEntityException();
  await this.roomService.updateUserAdminStatus(updateAdmin.userId, roomToUpdate);
  for (const user of roomToUpdate.users) {
    const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
    const rooms = await this.roomService.getRoomsForUser(user.id);
    for (const connection of connections) {
      this.server.to(connection.socketId).emit('rooms', rooms);
    }
  }

  }

  @UseGuards(JwtSocketCookie, RolesGuard)
  @SubscribeMessage('getAllRooms')
  async getAllRooms(): Promise<RoomEntity[]> {
    return await this.roomService.getAllRooms();
  }
}


