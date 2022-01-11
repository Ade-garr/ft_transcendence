import { RoomI } from './interfaces/room.interface';
import { MuteEntity } from './entities/mute.entity';
import { Repository } from 'typeorm';
export declare class MuteService {
    private readonly muteUserRepository;
    constructor(muteUserRepository: Repository<MuteEntity>);
    create(userId: number, time: string, room: RoomI): Promise<MuteEntity>;
}
