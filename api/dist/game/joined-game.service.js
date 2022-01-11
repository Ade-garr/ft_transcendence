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
exports.JoinedGameService = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const joined_game_entity_1 = require("./entities/joined-game.entity");
let JoinedGameService = class JoinedGameService {
    constructor(joinedGameRepository) {
        this.joinedGameRepository = joinedGameRepository;
    }
    async create(joinedGame) {
        return this.joinedGameRepository.save(joinedGame);
    }
    async findByGame(gameId) {
        return this.joinedGameRepository
            .createQueryBuilder('joined_game_entity')
            .where('joined_game_entity.gameId = :gameId', { gameId })
            .leftJoinAndSelect('joined_game_entity.user', 'user')
            .getMany();
    }
    async disconnectAllInGame(gameId) {
        this.joinedGameRepository
            .createQueryBuilder('joined_game_entity')
            .where('game.id = :gameId', { gameId })
            .delete()
            .execute();
    }
    async deleteAll() {
        await this.joinedGameRepository
            .createQueryBuilder()
            .delete()
            .execute();
    }
};
JoinedGameService = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(joined_game_entity_1.JoinedGameEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], JoinedGameService);
exports.JoinedGameService = JoinedGameService;
//# sourceMappingURL=joined-game.service.js.map