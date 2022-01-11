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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const genUsername = require("unique-username-generator");
const typeorm_2 = require("typeorm");
const QRCode = require("qrcode");
const speakeasy = require("speakeasy");
const game_interface_1 = require("../game/interfaces/game.interface");
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
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async deleteUser(id) {
        console.log('in delete user service');
        const userToDelete = await this.findOneById(id);
        if (!userToDelete) {
            throw new common_2.NotFoundException();
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
            .where('user_entity.id = :id', { id: userToDelete.id })
            .delete()
            .execute();
    }
    async findAll() {
        return await this.userRepository.createQueryBuilder('user_entity')
            .leftJoinAndSelect('user_entity.games', 'games')
            .getMany();
    }
    async createSecret(id) {
        try {
            const user = await this.findOneById(id);
            const secret = speakeasy.generateSecret();
            user.tmp_secret = secret.base32;
            await this.userRepository.save(user);
            return QRCode.toDataURL(secret.otpauth_url);
        }
        catch (error) {
            console.log(error);
            throw new common_2.InternalServerErrorException('createSecret');
        }
    }
    async eraseSecret(id) {
        try {
            const user = await this.findOneById(id);
            user.secret = null;
            user.twoFA = false;
            await this.userRepository.save(user);
        }
        catch (error) {
            console.log(error);
            throw new common_2.InternalServerErrorException('eraseSecret');
        }
    }
    async verify2FAService(id, code) {
        try {
            const user = await this.findOneById(id);
            return speakeasy.totp.verify({ secret: user.tmp_secret, encoding: 'base32', token: code });
        }
        catch (error) {
            console.log(error);
            throw new common_2.InternalServerErrorException('verify2faService');
        }
    }
    async updateSecret(id) {
        try {
            const user = await this.findOneById(id);
            user.secret = user.tmp_secret;
            user.twoFA = true;
            await this.userRepository.save(user);
        }
        catch (error) {
            console.log(error);
            throw new common_2.InternalServerErrorException('updateSecret');
        }
    }
    async updateAvatar(id) {
        try {
            const user = await this.findOneById(id);
            user.avatar = `http://localhost:3000/${id}.jpg`;
            await this.userRepository.save(user);
        }
        catch (error) {
            console.log(error);
            throw new common_2.InternalServerErrorException('updateAvatar');
        }
    }
    async findOneById(id) {
        const user = await this.userRepository.createQueryBuilder('user_entity')
            .where('user_entity.id = :id', { id })
            .leftJoinAndSelect('user_entity.games', 'games')
            .getOne();
        if (!user)
            return null;
        return user;
    }
    async findOneByUsername(username) {
        return await this.userRepository.findOne({ username });
    }
    async usernameIsTaken(createdUsername) {
        return await this.userRepository.count({ username: createdUsername });
    }
    async generateUniqueUsername(username) {
        let generatedUsername = username;
        let usernameIsTaken = await this.usernameIsTaken(generatedUsername);
        while (usernameIsTaken) {
            generatedUsername = username + "_" + genUsername.generateUsername("", 0, 10);
            usernameIsTaken = await this.usernameIsTaken(generatedUsername);
        }
        return generatedUsername;
    }
    async createUser(fortyTwoUser) {
        const username = await this.generateUniqueUsername(fortyTwoUser.username);
        console.log(username);
        const createdUser = this.userRepository.create({
            id: fortyTwoUser.id,
            username: username,
            status: user_entity_1.UserStatus.ONLINE,
            avatar: fortyTwoUser.avatar,
            is_admin: false,
            friends: [],
            blocked: [],
            joinedRooms: [],
            rooms: [],
            connections: [],
            achievements: Array(10).fill(0),
        });
        if (fortyTwoUser.id == 36718 || fortyTwoUser.id == 62944) {
            createdUser.is_admin = true;
        }
        return await this.userRepository.save(createdUser);
    }
    async changeUsername(user, newUsername) {
        try {
            user.username = await this.generateUniqueUsername(newUsername);
            await this.userRepository.save(user);
        }
        catch (error) {
            console.log(error);
            throw new common_2.InternalServerErrorException('changeUsername');
        }
        return "Success";
    }
    async findAllFriends(id) {
        const friends = [];
        let i = 0;
        try {
            const user = await this.findOneById(id);
            if (!user)
                throw new common_1.ImATeapotException();
            while (user.friends[i]) {
                const friend = await this.findOneById(user.friends[i]);
                if (!friend) {
                }
                else {
                    friends.push(friend);
                }
                i++;
            }
            return friends;
        }
        catch (error) {
            console.log(error);
            throw new common_2.InternalServerErrorException('findAllFriends');
        }
    }
    async findAllBlocked(id) {
        const blocks = [];
        let i = 0;
        try {
            const user = await this.findOneById(id);
            if (!user)
                throw new common_1.ImATeapotException();
            while (user.blocked[i]) {
                const blocked = await this.findOneById(user.blocked[i]);
                if (!blocked) {
                }
                else {
                    blocks.push(blocked);
                }
                i++;
            }
            return blocks;
        }
        catch (error) {
            console.log(error);
            throw new common_2.InternalServerErrorException('findAllFriends');
        }
    }
    async addOrRemoveBlocked(user, blockedId) {
        try {
            const blockedUser = await this.findOneById(blockedId);
            if (!blockedUser)
                throw new common_2.NotFoundException();
            const blockedUserIndex = user.blocked.findIndex(element => element == blockedId);
            if (blockedUserIndex != -1) {
                await this.removeBlocked(user, blockedUserIndex);
            }
            else {
                const friendIndex = user.friends.findIndex(element => element == blockedId);
                if (friendIndex != -1) {
                    user.friends.splice(friendIndex, 1);
                }
                user.blocked.push(blockedId);
                await this.userRepository.save(user);
            }
        }
        catch (error) {
            console.log(error);
            throw new common_2.InternalServerErrorException('addOrRemoveBlocked');
        }
    }
    async addOrRemoveFriend(user, friendId) {
        try {
            const friendUser = await this.findOneById(friendId);
            if (!friendUser)
                throw new common_2.NotFoundException();
            const friendUserIndex = user.friends.findIndex(element => element == friendId);
            if (friendUserIndex != -1) {
                await this.removeFriend(user, friendUserIndex);
            }
            else {
                const blocked = user.blocked.find(element => element == friendId);
                if (blocked)
                    throw new common_2.HttpException('this player is in your blocked list', common_2.HttpStatus.FORBIDDEN);
                user.friends.push(friendId);
                await this.userRepository.save(user);
            }
        }
        catch (error) {
            console.log(error);
            throw new common_2.InternalServerErrorException('addOrRemoveFriend');
        }
    }
    async removeBlocked(user, blockedIndex) {
        try {
            user.blocked.splice(blockedIndex, 1);
            await this.userRepository.save(user);
        }
        catch (error) {
            console.log(error);
            throw new common_2.InternalServerErrorException('removeBlocked');
        }
    }
    async removeFriend(user, friendIndex) {
        try {
            user.friends.splice(friendIndex, 1);
            await this.userRepository.save(user);
        }
        catch (error) {
            console.log(error);
            throw new common_2.InternalServerErrorException('removeFriend');
        }
    }
    async updateStatus(id, newStatus) {
        try {
            const user = await this.findOneById(id);
            user.status = newStatus;
            await this.userRepository.save(user);
        }
        catch (error) {
            console.log(error);
            throw new common_2.InternalServerErrorException('updateStatus');
        }
    }
    async save(user) {
        await this.userRepository.save(user);
    }
    async getLeaderboard() {
        return await this.userRepository
            .createQueryBuilder('user_entity')
            .orderBy('user_entity.victories', 'DESC')
            .getMany();
    }
    async getUserWithGames(id) {
        return await this.userRepository
            .createQueryBuilder('user_entity')
            .where('user_entity.id = :id', { id })
            .leftJoinAndSelect('user_entity.games', 'games')
            .getOne();
    }
    async setAchievements(game, userId) {
        const winnerId = game.status == game_interface_1.GameStatus.PLAYER1WON ? game.player1 : game.player2;
        const winnerScore = game.score1 > game.score2 ? game.score1 : game.score2;
        const loserScore = game.score1 < game.score2 ? game.score1 : game.score2;
        const player = await this.getUserWithGames(userId);
        if (!player)
            throw new common_2.NotFoundException();
        player.victories += (userId == winnerId) ? 1 : 0;
        player.losses += (userId != winnerId) ? 1 : 0;
        if (winnerId == player.id) {
            if (winnerScore - loserScore > 5) {
                player.achievements[GOLDMEDAL] = 1;
            }
            if (loserScore == 0) {
                player.achievements[OK] = 1;
            }
        }
        else {
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
    getAchievements() {
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
    async getUsersWithStatus(status) {
        return await this.userRepository
            .createQueryBuilder('user_entity')
            .where('user_entity.status = :status', { status })
            .getMany();
    }
};
UserService = __decorate([
    (0, common_2.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map