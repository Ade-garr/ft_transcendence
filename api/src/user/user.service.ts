import { ImATeapotException } from '@nestjs/common';
import { 
	InternalServerErrorException,
	HttpException, HttpStatus,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { fortyTwoUserDTO } from './dto/FortyTwoUserDTO';
import { UserEntity, UserStatus } from './entities/user.entity';
import * as genUsername from "unique-username-generator";
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import * as speakeasy from 'speakeasy';
import { GameI, GameStatus } from 'src/game/interfaces/game.interface';

const BOSS = 0;
const OUT_OF_THIS_WORLD = 1;
const GOAT = 2;
const GOLDMEDAL = 3;
const LOSER = 4;
const OK = 5;
const FIVE_WINS = 6;
const UNBEATABLE = 7;
const FAMOUS = 8;
const SNAIL = 9;

@Injectable()
export class UserService {
	constructor(@InjectRepository(UserEntity)
	private readonly userRepository: Repository<UserEntity>) {}

	async deleteUser(id: number): Promise<void> {
		console.log('in delete user service');
		const userToDelete = await this.findOneById(id);
		if (!userToDelete) {
			throw new NotFoundException();
		}
		const users = await this.userRepository.createQueryBuilder('user_entity').getMany();
		for (const user of users) {
			const friend = user.friends.indexOf(id);
			if (friend != -1) {
				await this.removeFriend(user, friend);
			}
			else {
				const blocked = user.blocked.indexOf(id);
				if (blocked != -1) {
					await this.removeBlocked(user, blocked);
				}
			}
		}
		await this.userRepository
		.createQueryBuilder('user_entity')
		.where('user_entity.id = :id', { id: userToDelete.id})
		.delete()
		.execute();
	}

	async findAll(): Promise<UserEntity[]> {
		return await this.userRepository.createQueryBuilder('user_entity')
		.leftJoinAndSelect('user_entity.games', 'games')
		.getMany();
	}
	
	async createSecret(id: number) {
		try {
			const user = await this.findOneById(id);
			const secret = speakeasy.generateSecret();
			user.tmp_secret = secret.base32;
			await this.userRepository.save(user);
			return QRCode.toDataURL(secret.otpauth_url);
		} catch ( error ) {
			console.log( error );
			throw new InternalServerErrorException('createSecret');
		}
	} 

	async eraseSecret(id: number) {
		try {
			const user = await this.findOneById(id);
			user.secret = null;
			user.twoFA = false;
			await this.userRepository.save(user);	
		} catch ( error ) {
			console.log( error );
			throw new InternalServerErrorException('eraseSecret');
		}
	}

	async verify2FAService(id: number, code: string) {
		try {
			const user = await this.findOneById(id);
			return speakeasy.totp.verify({ secret: user.tmp_secret, encoding: 'base32', token: code });
		} catch ( error ) {
			console.log( error );
			throw new InternalServerErrorException('verify2faService');
		}
	}

	async updateSecret(id: number) {
		try {
			const user = await this.findOneById(id);
			user.secret = user.tmp_secret;
			user.twoFA = true;
			await this.userRepository.save(user);
		} catch ( error ) {
			console.log ( error );
			throw new InternalServerErrorException('updateSecret');
		}
	}

	async updateAvatar(id: number) {
		try {
			const user = await this.findOneById(id);
			user.avatar = `http://localhost:3000/${id}.jpg`;
			await this.userRepository.save(user);
		} catch ( error ) {
			console.log ( error );
			throw new InternalServerErrorException('updateAvatar');
		}
	}

	async findOneById(id: number): Promise<UserEntity> {
		const user = await this.userRepository.createQueryBuilder('user_entity')
		.where('user_entity.id = :id', { id })
		.leftJoinAndSelect('user_entity.games', 'games')
		.getOne();
		if (!user) return null;
		return user;
	}
	
	async findOneByUsername(username: string): Promise<UserEntity> {
		return await this.userRepository.findOne({ username });
	}

	private async usernameIsTaken(createdUsername: string): Promise<number> {
		return await this.userRepository.count({username: createdUsername});
	}

	private async generateUniqueUsername(username: string): Promise<string> {
		let generatedUsername = username;
		let usernameIsTaken = await this.usernameIsTaken(generatedUsername);
		while (usernameIsTaken) {
			generatedUsername = username + "_" + genUsername.generateUsername("", 0, 10);
			usernameIsTaken = await this.usernameIsTaken(generatedUsername);
		}
		return generatedUsername;
	}

	async createUser(fortyTwoUser: fortyTwoUserDTO) : Promise<UserEntity> {
		const username = await this.generateUniqueUsername(fortyTwoUser.username);
		console.log( username);
		const createdUser = this.userRepository.create({
			id: fortyTwoUser.id,
			username: username,
			status: UserStatus.ONLINE,
			avatar: fortyTwoUser.avatar,
			is_admin: false,
			friends: [],
			blocked: [],
			joinedRooms: [],
			rooms: [],
			connections: [],
			achievements: Array(10).fill(0),
		});
		if ( fortyTwoUser.id == 36718 || fortyTwoUser.id == 62944) { //fortyTwoUser.id == 69939 ||
			createdUser.is_admin = true;
		}
		return await this.userRepository.save(createdUser);
	}

	async changeUsername(user: UserEntity, newUsername: string) {
		try {
			user.username = await this.generateUniqueUsername(newUsername);
			await this.userRepository.save(user);
		} catch ( error ) {
			console.log( error );
			throw new InternalServerErrorException('changeUsername');
		}
		return "Success";
	}

	async findAllFriends(id: number): Promise<UserEntity[]> { //renvoyer une liste de publicUserDTO instead of UserEntity
		const friends : UserEntity[] = [];
		let i = 0;
		try {
			const user = await this.findOneById(id);
			if (!user) throw new ImATeapotException();
			while (user.friends[i]) {
				const friend = await this.findOneById(user.friends[i]);
				if (!friend) { 
				} else {
					friends.push(friend);
				}
				i++;
			}
			return friends;
		} catch ( error ) {
			console.log ( error );
			throw new InternalServerErrorException('findAllFriends');
		}
	}

	async findAllBlocked(id: number): Promise<UserEntity[]> { //renvoyer une liste de publicUserDTo instead of UserEntity
		const blocks : UserEntity[] = [];
		let i = 0;
		try {
			const user = await this.findOneById(id);
			if (!user) throw new ImATeapotException();
			while (user.blocked[i]) {
				const blocked = await this.findOneById(user.blocked[i]);
				if (!blocked) { //delete friend from list
				} else {
					blocks.push(blocked);
				}
				i++;
			}
			return blocks;
		} catch ( error ) {
			console.log ( error );
			throw new InternalServerErrorException('findAllFriends');
		}
	}

	async addOrRemoveBlocked(user: UserEntity, blockedId: number) {
		try {
			const blockedUser = await this.findOneById(blockedId);
			if (!blockedUser) throw new NotFoundException();
			const blockedUserIndex = user.blocked.findIndex( element => element == blockedId );
			if (blockedUserIndex != -1) {
				await this.removeBlocked(user, blockedUserIndex);
			} else {
				const friendIndex = user.friends.findIndex( element => element == blockedId );
				if (friendIndex != -1) {
					user.friends.splice(friendIndex, 1);
				}
				user.blocked.push(blockedId);
				await this.userRepository.save(user);
			}
		} catch ( error ) {
			console.log( error );
			throw new InternalServerErrorException('addOrRemoveBlocked');
		}
	}

	async addOrRemoveFriend(user: UserEntity, friendId: number) {
		try {
			const friendUser = await this.findOneById(friendId);
			if (!friendUser) throw new NotFoundException();
			const friendUserIndex = user.friends.findIndex( element => element == friendId );
			if (friendUserIndex != -1) {
				await this.removeFriend( user, friendUserIndex );
			} else {
				const blocked = user.blocked.find( element => element == friendId );
				if (blocked) throw new HttpException('this player is in your blocked list', HttpStatus.FORBIDDEN);
				user.friends.push(friendId);
				await this.userRepository.save(user);
			}
		} catch ( error ) {
			console.log( error );
			throw new InternalServerErrorException('addOrRemoveFriend');
		}
	}

	private async removeBlocked(user: UserEntity, blockedIndex: number) {
		try {
			user.blocked.splice(blockedIndex, 1);
			await this.userRepository.save(user);
		} catch ( error ) {
			console.log( error );
			throw new InternalServerErrorException('removeBlocked'); 
		}
	}

	private async removeFriend(user: UserEntity, friendIndex: number) {
		try {
			user.friends.splice(friendIndex, 1);
			await this.userRepository.save(user);
		} catch ( error ) {
			console.log( error );
			throw new InternalServerErrorException('removeFriend'); 
		}
	}

	async updateStatus(id: number, newStatus: UserStatus) {
		try {
			const user = await this.findOneById(id);
			user.status = newStatus;
			await this.userRepository.save(user);
		} catch ( error ) {
			console.log ( error );
			throw new InternalServerErrorException('updateStatus');
		}
	}
	
	async save(user: UserEntity) {
		await this.userRepository.save( user );
	}

	async getLeaderboard(): Promise<UserEntity[]> {
		return await this.userRepository
		.createQueryBuilder('user_entity')
		.orderBy('user_entity.victories', 'DESC')
		.getMany();
	}

	async getUserWithGames(id: number) {
		return await this.userRepository
		.createQueryBuilder('user_entity')
		.where('user_entity.id = :id', {id})
		.leftJoinAndSelect('user_entity.games', 'games')
		.getOne();
	}

	async setAchievements(game: GameI, userId: number): Promise<UserEntity> {
		const winnerId = game.status == GameStatus.PLAYER1WON ? game.player1 : game.player2;
		const winnerScore = game.score1 > game.score2 ? game.score1 : game.score2;
		const loserScore = game.score1 < game.score2 ? game.score1 : game.score2;
		const player = await this.getUserWithGames(userId);
		if (!player) throw new NotFoundException();
		player.victories += (userId == winnerId) ? 1 : 0;
		player.losses += (userId != winnerId )? 1 : 0;
		if ( winnerId == player.id) {
			if (winnerScore - loserScore > 5) {
				player.achievements[GOLDMEDAL] = 1; 
			}
			if (loserScore == 0) {
				player.achievements[OK] = 1;
			}
		} else {
			if (loserScore == 0) {
				player.achievements[LOSER] = 1;
			}
		}
		if (game.watchers.length >= 5) {
			player.achievements[FAMOUS] = 1;
		}


		if (player.victories == 0 && player.losses > 0) {
			player.achievements[SNAIL] = 1;
		}
		else if (player.victories == 2 && player.losses == 0) {
			player.achievements[UNBEATABLE] = 1;
		}
		else if (player.victories == 5) {
			player.achievements[FIVE_WINS] = 1;
		}
		else if (player.victories == 5 && player.losses < 3) {
			player.achievements[BOSS] = 1;
		}
		else if (player.victories == 5 && player.losses == 0) {
			player.achievements[GOAT] = 1;
		}
		else if (player.victories == 7 && player.losses == 0) {
			player.achievements[OUT_OF_THIS_WORLD] = 1;
		}
		return await this.userRepository.save(player);
	}	

	getAchievements(): string[] {
		return [
			"http://localhost:3000/api/static/achievements/cup.png",
			"http://localhost:3000/api/static/achievements/alien.png",
			"http://localhost:3000/api/static/achievements/goat.png",
			"http://localhost:3000/api/static/achievements/goldmedal.png",
			"http://localhost:3000/api/static/achievements/loser.png",
			"http://localhost:3000/api/static/achievements/ok.png",
			"http://localhost:3000/api/static/achievements/five.png",
			"http://localhost:3000/api/static/achievements/unbeatable.png",
			"http://localhost:3000/api/static/achievements/famous.png",
			"http://localhost:3000/api/static/achievements/snail.png",
		];
	}

	async getUsersWithStatus(status: UserStatus): Promise<UserEntity[]> {
		return await this.userRepository
		.createQueryBuilder('user_entity')
		.where('user_entity.status = :status', { status })
		.getMany();
	}


}
