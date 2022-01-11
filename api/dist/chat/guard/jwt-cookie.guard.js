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
exports.JwtSocketCookie = void 0;
const user_entity_1 = require("../../user/entities/user.entity");
const user_service_1 = require("../../user/user.service");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const cookie_1 = require("cookie");
let JwtSocketCookie = class JwtSocketCookie {
    constructor(jwtService, userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }
    async canActivate(context) {
        const cookie = context.args[0].handshake.headers['cookie'];
        const { access_token: token } = (0, cookie_1.parse)(cookie);
        const payload = this.jwtService.verify(token, { secret: process.env.SECRET_JWT });
        const { username } = payload;
        const user = await this.userService.findOneByUsername(username);
        if (payload['auth'] === false && user.secret != null) {
            return false;
        }
        return true;
    }
};
JwtSocketCookie = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        user_service_1.UserService])
], JwtSocketCookie);
exports.JwtSocketCookie = JwtSocketCookie;
//# sourceMappingURL=jwt-cookie.guard.js.map