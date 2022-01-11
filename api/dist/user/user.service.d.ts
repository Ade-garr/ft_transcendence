import { fortyTwoUserDTO } from './dto/FortyTwoUserDTO';
import { UserEntity, UserStatus } from './entities/user.entity';
import { Repository } from 'typeorm';
import { GameI } from 'src/game/interfaces/game.interface';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: Repository<UserEntity>);
    deleteUser(id: number): Promise<void>;
    findAll(): Promise<UserEntity[]>;
    createSecret(id: number): Promise<string>;
    eraseSecret(id: number): Promise<void>;
    verify2FAService(id: number, code: string): Promise<boolean>;
    updateSecret(id: number): Promise<void>;
    updateAvatar(id: number): Promise<void>;
    findOneById(id: number): Promise<UserEntity>;
    findOneByUsername(username: string): Promise<UserEntity>;
    private usernameIsTaken;
    private generateUniqueUsername;
    createUser(fortyTwoUser: fortyTwoUserDTO): Promise<UserEntity>;
    changeUsername(user: UserEntity, newUsername: string): Promise<string>;
    findAllFriends(id: number): Promise<UserEntity[]>;
    findAllBlocked(id: number): Promise<UserEntity[]>;
    addOrRemoveBlocked(user: UserEntity, blockedId: number): Promise<void>;
    addOrRemoveFriend(user: UserEntity, friendId: number): Promise<void>;
    private removeBlocked;
    private removeFriend;
    updateStatus(id: number, newStatus: UserStatus): Promise<void>;
    save(user: UserEntity): Promise<void>;
    getLeaderboard(): Promise<UserEntity[]>;
    getUserWithGames(id: number): Promise<UserEntity>;
    setAchievements(game: GameI, userId: number): Promise<UserEntity>;
    getAchievements(): string[];
    getUsersWithStatus(status: UserStatus): Promise<UserEntity[]>;
}
