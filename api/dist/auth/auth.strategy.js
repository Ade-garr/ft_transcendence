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
exports.OAuth2Strategy = void 0;
const banned_service_1 = require("./../user/banned.service");
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const passport_42_1 = require("passport-42");
let OAuth2Strategy = class OAuth2Strategy extends (0, passport_1.PassportStrategy)(passport_42_1.Strategy, 'OAuth2') {
    constructor(authService, bannedService) {
        super({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
            profileFields: {
                'id': 'id',
                'username': 'login',
                'photos.0.value': 'image_url'
            },
        });
        this.authService = authService;
        this.bannedService = bannedService;
    }
    async validate(accessToken, refreshToken, profile) {
        const { username } = profile;
        const user = {
            id: parseInt(profile.id),
            username: username,
            avatar: profile['photos'][0]['value'],
        };
        const isBan = await this.bannedService.isBan(user.id);
        if (isBan) {
            return false;
        }
        return await this.authService.findOrCreate(user);
    }
};
OAuth2Strategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        banned_service_1.BannedService])
], OAuth2Strategy);
exports.OAuth2Strategy = OAuth2Strategy;
//# sourceMappingURL=auth.strategy.js.map