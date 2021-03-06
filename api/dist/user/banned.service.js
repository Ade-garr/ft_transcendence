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
exports.BannedService = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const banned_entity_1 = require("./entities/banned.entity");
const typeorm_2 = require("@nestjs/typeorm");
let BannedService = class BannedService {
    constructor(bannedRepository) {
        this.bannedRepository = bannedRepository;
    }
    async banUser(id) {
        const query = await this.bannedRepository
            .createQueryBuilder('banned_entity')
            .where('banned_entity.banId = :id', { id })
            .getOne();
        if (!query) {
            const banId = await this.bannedRepository.create({ banId: id });
            await this.bannedRepository.save(banId);
        }
    }
    async isBan(id) {
        const banId = await this.bannedRepository.findOne({ banId: id });
        if (!banId) {
            return false;
        }
        else {
            return true;
        }
    }
    async unbanUser(id) {
        const banId = await this.bannedRepository.findOne({ banId: id });
        if (banId) {
            await this.bannedRepository.delete(banId);
        }
    }
};
BannedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(banned_entity_1.BannedEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], BannedService);
exports.BannedService = BannedService;
//# sourceMappingURL=banned.service.js.map