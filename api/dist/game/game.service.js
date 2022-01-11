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
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./../user/user.service");
const game_entity_1 = require("./entities/game.entity");
const common_2 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const game_interface_1 = require("./interfaces/game.interface");
let GameService = class GameService {
    constructor(gameRepository, userService) {
        this.gameRepository = gameRepository;
        this.userService = userService;
    }
    async createGameI(player1Id, createGame, id) {
        const game = {
            id: id,
            status: game_interface_1.GameStatus.INCOMPLETE,
            player1: player1Id,
            player2: createGame.player2,
            acceleration: createGame.acceleration,
            theme: createGame.theme,
            score1: 0,
            score2: 0,
            watchers: [],
            direction: { x: 1, y: 1 },
            pad1: 240 - 34,
            pad2: 240 - 34,
            ball: {
                x: 325,
                y: 240,
            }
        };
        return game;
    }
    async save(game) {
        try {
            const saveGame = this.gameRepository.create({
                player1: game.player1,
                player2: game.player2,
                score1: game.score1,
                score2: game.score2,
            });
            return await this.gameRepository.save(saveGame);
        }
        catch (error) {
            console.log(error);
            throw new common_1.InternalServerErrorException('save game');
        }
    }
};
GameService = __decorate([
    (0, common_2.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(game_entity_1.GameEntity)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => user_service_1.UserService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        user_service_1.UserService])
], GameService);
exports.GameService = GameService;
//# sourceMappingURL=game.service.js.map