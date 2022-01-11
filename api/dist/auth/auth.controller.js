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
exports.AuthController = void 0;
const tfa_guard_1 = require("./tfa.guard");
const auth_service_1 = require("./auth.service");
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("./auth.guard");
const jwt_1 = require("@nestjs/jwt");
const swagger_1 = require("@nestjs/swagger");
const user_service_1 = require("../user/user.service");
let AuthController = class AuthController {
    constructor(userService, jwtService, authService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.authService = authService;
    }
    login() { }
    async generateJWT(res, req) {
        const user = await this.userService.findOneById(req.user['id']);
        if (!user)
            throw new common_1.UnauthorizedException();
        let auth = user.secret == null ? true : false;
        const accessToken = this.jwtService.sign({ id: user.id, auth });
        res.cookie('access_token', accessToken, { httpOnly: true });
        if (auth === false) {
            res.redirect('http://localhost:8080/2fa');
        }
        else {
            res.redirect('http://localhost:8080/profile');
        }
    }
    async validate_2fa(res, req, code) {
        const verify = await this.authService.verify2FAService(req.user.id, code);
        if (!verify)
            throw new common_1.HttpException('Pin entered incorrect, 2FA enabling failed', common_1.HttpStatus.FORBIDDEN);
        const accessToken = this.jwtService.sign({ id: req.user.id, auth: true });
        res.clearCookie('access_token');
        res.cookie('access_token', accessToken, { httpOnly: true });
    }
};
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.OAuth2AuthGuard),
    (0, common_1.Get)('/login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.OAuth2AuthGuard),
    (0, common_1.Get)('/callback'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "generateJWT", null);
__decorate([
    (0, common_1.UseGuards)(tfa_guard_1.default),
    (0, common_1.Post)('/validate2FA'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validate_2fa", null);
AuthController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        auth_service_1.AuthService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map