import { Repository } from 'typeorm';
import { BannedEntity } from './entities/banned.entity';
export declare class BannedService {
    private readonly bannedRepository;
    constructor(bannedRepository: Repository<BannedEntity>);
    banUser(id: number): Promise<void>;
    isBan(id: number): Promise<boolean>;
    unbanUser(id: number): Promise<void>;
}
