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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const common_2 = require("@nestjs/common");
const passport_jwt_1 = require("passport-jwt");
const user_service_1 = require("../user/user.service");
const banned_service_1 = require("../user/banned.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    constructor(userService, bannedService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([
                (request) => {
                    let accessToken = request === null || request === void 0 ? void 0 : request.cookies['access_token'];
                    return accessToken;
                }
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
        this.userService = userService;
        this.bannedService = bannedService;
    }
    async validate(payload) {
        const isBan = await this.bannedService.isBan(parseInt(payload.id));
        if (isBan) {
            throw new common_1.UnauthorizedException('is banned');
        }
        const user = await this.userService.findOneById(payload.id);
        if (user == undefined)
            throw new common_1.UnauthorizedException();
        if (payload.auth == false)
            throw new common_1.UnauthorizedException();
        return user;
    }
};
JwtStrategy = __decorate([
    (0, common_2.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        banned_service_1.BannedService])
], JwtStrategy);
exports.JwtStrategy = JwtStrategy;
//# sourceMappingURL=jwt.strategy.js.map