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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(userService, jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async findOrCreate(fortyTwoUser) {
        try {
            const user = await this.userService.findOneById(fortyTwoUser.id);
            if (!user) {
                return await this.userService.createUser(fortyTwoUser);
            }
            return user;
        }
        catch (error) {
            console.log(error);
            throw new common_1.InternalServerErrorException('findOrCreate');
        }
    }
    async generateJwt(user) {
        return await this.jwtService.signAsync(user);
    }
    async comparePassword(plainPassword, storedPasswordHash) {
        return await bcrypt.compare(plainPassword, storedPasswordHash);
    }
    async hashPassword(plainPassword) {
        return await bcrypt.hash(plainPassword, 12);
    }
    async verifyJwt(jwt) {
        try {
            const validToken = await this.jwtService.verifyAsync(jwt, { secret: process.env.JWT_SECRET });
            if (!validToken)
                throw new common_1.UnauthorizedException();
            return validToken;
        }
        catch (error) {
            console.log(error);
            throw new common_1.InternalServerErrorException('verifyJwt');
        }
    }
    async verify2FAService(id, code) {
        return await this.userService.verify2FAService(id, code);
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => user_service_1.UserService))),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map