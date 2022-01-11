import { UserService } from './../user/user.service';
import { RoomI } from './interfaces/room.interface';
import { UserI } from './../user/interfaces/user.interface';
import { JoinedRoomI } from './interfaces/joined-room.interface';
import { JoinedRoomEntity } from './entities/joined-room.entity';
import { Repository } from 'typeorm';
export declare class JoinedRoomService {
    private readonly joinedRoomRepository;
    private readonly userService;
    constructor(joinedRoomRepository: Repository<JoinedRoomEntity>, userService: UserService);
    create(joinedRoom: JoinedRoomI): Promise<JoinedRoomI>;
    findByUser(user: UserI): Promise<JoinedRoomI[]>;
    findByRoom(room: RoomI): Promise<JoinedRoomI[]>;
    deleteBySocketId(socketId: string): Promise<import("typeorm").DeleteResult>;
    removeUserFromRoomId(user: UserI, room: RoomI): Promise<void>;
    disconnectAllInRoom(roomId: number): Promise<void>;
    deleteAll(): Promise<void>;
}
