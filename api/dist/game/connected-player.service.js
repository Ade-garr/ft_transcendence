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
exports.ConnectedPlayerService = void 0;
const connected_player_entity_1 = require("./entities/connected-player.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_interface_1 = require("../user/interfaces/user.interface");
let ConnectedPlayerService = class ConnectedPlayerService {
    constructor(connectedPlayerRepository) {
        this.connectedPlayerRepository = connectedPlayerRepository;
    }
    async create(connectedPlayer) {
        return this.connectedPlayerRepository.save(this.connectedPlayerRepository.create(connectedPlayer));
    }
    async deleteBySocketId(socketId) {
        return this.connectedPlayerRepository.delete({ socketId });
    }
    async findByUser(user) {
        return this.connectedPlayerRepository.find({ user });
    }
    async findAll() {
        return await this.connectedPlayerRepository.find();
    }
    async deleteAll() {
        await this.connectedPlayerRepository
            .createQueryBuilder()
            .delete()
            .execute();
    }
};
ConnectedPlayerService = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(connected_player_entity_1.ConnectedPlayerEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConnectedPlayerService);
exports.ConnectedPlayerService = ConnectedPlayerService;
//# sourceMappingURL=connected-player.service.js.map