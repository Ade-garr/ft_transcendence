import { createRoomDTO } from './dto/createRoomDTO';
import { MuteUserDTO } from './dto/MuteUserDTO';
import { MuteService } from './mute.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { JoinedRoomService } from './joined-room.service';
import { UserService } from './../user/user.service';
import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, UnprocessableEntityException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RoomEntity, RoomStatus } from "./entities/room.entity";
import { RoomI } from "./interfaces/room.interface";
import * as bcrypt from 'bcrypt'; 
import { UserI } from "src/user/interfaces/user.interface";
import { MuteEntity } from './entities/mute.entity';


@Injectable()
export class RoomService {
    constructor(
        @InjectRepository(RoomEntity)
        private readonly roomRepository: Repository<RoomEntity>,
        private readonly muteService: MuteService,
        private readonly userService: UserService,
        private readonly joinedRoomService: JoinedRoomService,
    ) {}

    async createRoom(createRoom: createRoomDTO, creator: UserI): Promise<RoomI> {
        const user = await this.userService.findOneById(creator.id);
        if (!user) {
            throw new UnauthorizedException();
        }

        const newRoom = this.roomRepository.create({
            title: createRoom.title,
            messages: [],
            joinedUsers: [],
            users: [ user ],
            status: createRoom.status,
            password: createRoom.password,
            owner: creator.id,
            admins: [ creator.id ],
            bans: [],
            mutes: [],
        });

        // newRoom.admins.push( creator.id );
        // newRoom.users.push( user );

        if ( newRoom.status === RoomStatus.PROTECTED ) {
            const hashedPassword = await bcrypt.hash( createRoom.password, 12 ) ;
            if ( !hashedPassword ) {
                throw new InternalServerErrorException();
            } else {
                newRoom.password = hashedPassword;
            }
        }
        if ( newRoom.status !== RoomStatus.PRIVATE ) {
            const users = await this.userService.findAll();
            for (const userToAdd of users) {
                if (userToAdd.id != user.id)
                    newRoom.users.push(userToAdd);
            }
        }
        return await this.roomRepository.save(newRoom);
    }

    async getRoom(roomId: number): Promise<RoomEntity> {
        return await this.roomRepository
        .createQueryBuilder('room')
        .where('room.id = :roomId', {roomId})
        .leftJoinAndSelect('room.mutes', 'all_mutes')
        .getOne();
    }

    private async validatePassword( roomToJoin: RoomI, roomSent: RoomI) {
        try {
            const valid = await bcrypt.compare(roomSent.password, roomToJoin.password);
            if (!valid) {
                throw new UnauthorizedException();
            }
        } catch ( error ) {
            throw new UnauthorizedException();
        }
    }

    private async verifyUser( room: RoomEntity, user: UserI) {
        try {
            if (!room.users.find(element => element.id == user.id)) {
                throw new UnauthorizedException();
            }
        } catch ( error ) {
            throw new UnauthorizedException();
        }
    }

    async onJoinRoom(roomSent: RoomI, user: UserEntity) {
        const roomToJoin = await this.roomRepository
        .createQueryBuilder('room')
        .where('room.id = :roomId', {roomId: roomSent.id})
        .leftJoinAndSelect('room.users', 'all_users')
        .getOne();
        if ( !roomToJoin || roomToJoin.bans.find( element => element == user.id))
        {
            throw new UnauthorizedException();
        } else if ( roomToJoin.status !== RoomStatus.PUBLIC) {
            if (roomToJoin.status === RoomStatus.PRIVATE) {
                await this.verifyUser(roomToJoin, user);
            } else if ( roomToJoin.status === RoomStatus.PROTECTED) {
                await this.validatePassword(roomToJoin, roomSent);
            }
            else {
                throw new UnauthorizedException();
            }
        }
        if (!roomToJoin.users.find(element => element == user)) {
            roomToJoin.users.push( user );
            await this.roomRepository.save(roomToJoin);
        }
    }


    async changePassword(room: RoomI) {
        const newRoom = await this.getRoom(room.id);
        if ( room.password == '' || room.password == undefined) {
            console.log('password', room.password)
            newRoom.password == '';
            newRoom.status = RoomStatus.PUBLIC;
        } else {
            const hashedPassword = await bcrypt.hash( room.password, 12 ) ;
            if ( !hashedPassword ) {
                throw new InternalServerErrorException();
            } else
                newRoom.password = hashedPassword;   
            newRoom.status = RoomStatus.PROTECTED;            
        }
        await this.roomRepository.save(newRoom);
    }

    async inviteToPrivateRoom(roomSent: RoomI, userId: number) {
        try {
            const roomId = roomSent.id;
            const user = await this.userService.findOneById(userId);
            const room = await this.roomRepository
            .createQueryBuilder('room')
            .where('room.id = :roomId', {roomId})
            .leftJoinAndSelect('room.users', 'all_users')
            .getOne();

            console.log('room in invite', room);
            if (!room || room.status != RoomStatus.PRIVATE) {
                throw new NotFoundException();
            }
    
            if (!room.users.find( element => element == user)) {
                room.users.push(user);
                await this.roomRepository.save(room);
            }
    
        } catch ( error ) {
            console.log( error );
            throw new UnauthorizedException();
        }
    }

    async getRoomsForUser(userId: number): Promise<RoomI[]> {
        const queryAllPublicAndProtectedRooms = this.roomRepository
        .createQueryBuilder('room')
        .where('room.status != :privateStatus', {privateStatus: RoomStatus.PRIVATE })
        .leftJoinAndSelect('room.users', 'all_users')
        .orderBy('room.updated_at', 'DESC');

        const queryUserPrivateRooms = this.roomRepository
        .createQueryBuilder('room')
        .leftJoin('room.users', 'users')
        .where('users.id = :userId', {userId})
        .andWhere('room.status = :privateStatus', {privateStatus : RoomStatus.PRIVATE })  
        .leftJoinAndSelect('room.users', 'all_users')
        .orderBy('room.updated_at', 'DESC');

        const allPubRooms: RoomEntity[] = await queryAllPublicAndProtectedRooms.getMany();
        const userPrivateRooms = await queryUserPrivateRooms.getMany();
        const allRooms = allPubRooms.concat(userPrivateRooms);
        const filteredRooms = [];
        for ( const room of allRooms ) {
            const isBan = room.bans.findIndex( element => element == userId);
            if (isBan == -1) {
                filteredRooms.push(room);
            }
        }
        return filteredRooms;
    }

    async banUserFromRoom( userId: number, idToBan: number, roomSent: RoomI ) {
        const room = await this.getRoomWithUser(roomSent.id);
        if ( room ) {
            const userIndex = room.users.findIndex( element => element.id == idToBan );
            if ( userIndex != -1 ) {
                if (room.admins.find( element => element == idToBan) && userId != room.owner) {
                    throw new UnauthorizedException();
                }
                room.users.splice( userIndex, 1 );
                if ( room.bans.findIndex( element => element == idToBan ) == -1 )
                    room.bans.push( idToBan );
                this.roomRepository.save(room);
            }
            await this.roomRepository.save( room );
        }
    }


    async unbanUserFromRoom(idToUnBan: number, roomId: number ) {
        const roomWithUsers = await this.getRoomWithUser(roomId);
        if ( roomWithUsers )  {
            let userIndex = roomWithUsers.bans.findIndex( element => element == idToUnBan );
            if ( userIndex != -1 ) {
                roomWithUsers.bans.splice( userIndex, 1 );
            }
            const user = await this.userService.findOneById(idToUnBan);
            userIndex = roomWithUsers.users.findIndex( element => element == user );
            if (userIndex == -1)
                roomWithUsers.users.push(user);
            await this.roomRepository.save( roomWithUsers );
            console.log(roomWithUsers);
        }
    }

    async onDeleteRoom(roomId: number) {
        const roomToDelete = await this.roomRepository.findOne({ id: roomId });
        if ( roomToDelete ) {
            console.log('delete room ', roomToDelete);
            try {
                await this.joinedRoomService.disconnectAllInRoom( roomToDelete.id );
                await this.roomRepository.delete( { id: roomToDelete.id } );
            } catch ( error ) {
                console.log(error);
                throw new InternalServerErrorException();
            }
        }
    }

    async getRoomWithUser(roomId: number) {
        return await this.roomRepository
        .createQueryBuilder('room')
        .where('room.id = :roomId', {roomId})
        .leftJoinAndSelect('room.users', 'all_users')
        .getOne();
    }

    async onUnjoinRoom(roomId: number, userId: number) {
        const room = await this.getRoomWithUser(roomId);
        if (!room) {
            throw new UnauthorizedException();
        }
        const userIndex = room.users.findIndex(element => element.id == userId );
        if (userIndex != -1) {
            const adminIndex = room.admins.findIndex( element => element == userId );
            if (adminIndex != -1)
                await this.updateUserAdminStatus(userId, room);
            console.log(room.owner)
            console.log(userId)
            if (room.owner == userId) {
                if (room.admins.length > 0) {
                    room.owner = room.admins[0];
                } else
                    return await this.onDeleteRoom(room.id);
            }
            room.users.splice(userIndex, 1);
            await this.roomRepository.save(room);
        }
        
    }

    async save(room: RoomEntity) {
        await this.roomRepository.save(room);
    }

    async updateUserAdminStatus(userId: number, roomToUpdate: RoomEntity) {
        try {
            let index: number;
            if ((index = roomToUpdate.admins.findIndex(element => element == userId )) != -1) {
                roomToUpdate.admins.splice(index, 1);
            }
            else
                roomToUpdate.admins.push(userId);
            await this.roomRepository.save(roomToUpdate);
        } catch ( error ) {
            throw new InternalServerErrorException();
        }
    }

    async onMuteUser(muteUser: MuteUserDTO, userId: number) {
        const roomId = muteUser.room.id;
        const room = await this.roomRepository
        .createQueryBuilder('room')
        .where('room.id = :roomId', {roomId})
        .leftJoinAndSelect('room.mutes', 'mutes')
        .getOne();
        if (room.admins.find( element => element == muteUser.id) && userId != room.owner) {
            throw new UnauthorizedException();
        }
        const muteIndex = room.mutes.findIndex( element => element.userId == userId);
        if (muteIndex != -1)
            room.mutes.splice(muteIndex, 1);
        // await this.roomService.save(room);

        let now =  new Date()
        var endOfSanction = new Date(now.getTime() + muteUser.duration * 60000);
        const newMute: MuteEntity = await this.muteService.create(muteUser.id, endOfSanction.getTime().toString(), room);
        room.mutes.push(newMute);
        await this.roomRepository.save(room);
        console.log(room);
    }

    async getAllRooms(): Promise<RoomEntity[]> {
        return await this.roomRepository
        .createQueryBuilder('room_entity')
        .getMany();
    }
}