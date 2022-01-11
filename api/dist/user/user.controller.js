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
exports.UserController = void 0;
const jwt_guard_1 = require("../auth/jwt.guard");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const roles_guard_1 = require("../auth/roles.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const banned_service_1 = require("./banned.service");
let UserController = class UserController {
    constructor(userService, bannedService) {
        this.userService = userService;
        this.bannedService = bannedService;
    }
    async addBlocked(id, req) {
        const user = await this.userService.findOneById(req.user.id);
        return await this.userService.addOrRemoveBlocked(user, id);
    }
    async addFriend(id, req) {
        const user = await this.userService.findOneById(req.user.id);
        return await this.userService.addOrRemoveFriend(user, id);
    }
    async findAllFriends(req) {
        return await this.userService.findAllFriends(req.user.id);
    }
    async findAllBlocked(req) {
        return await this.userService.findAllBlocked(req.user.id);
    }
    async uploadSingle(file, req) {
        await this.userService.updateAvatar(req.user.id);
    }
    async returnSecret(req) {
        const url = await this.userService.createSecret(req.user.id);
        return ({ url: url });
    }
    async disable2fa(req) {
        await this.userService.eraseSecret(req.user.id);
    }
    async update_name(req) {
        await this.userService.changeUsername(req.user, req.body.username);
    }
    async verify_2FA(req, code) {
        const verify = await this.userService.verify2FAService(req.user.id, code);
        if (!verify)
            throw new common_1.HttpException('Pin entered incorrect, 2FA enabling failed', common_1.HttpStatus.FORBIDDEN);
        await this.userService.updateSecret(req.user.id);
        const user = await this.userService.findOneById(req.user.id);
    }
    getUserProfile(req) {
        return req.user;
    }
    async deleteUser(res, req) {
        await this.userService.deleteUser(req.user.id);
        res.clearCookie('access_token');
    }
    async findAll() {
        return await this.userService.findAll();
    }
    async deleteUserAsAdmin(id) {
        await this.userService.deleteUser(id);
    }
    async logout(res) {
        res.clearCookie('access_token');
    }
    async getLeaderBoard() {
        return await this.userService.getLeaderboard();
    }
    getAchievements() {
        return this.userService.getAchievements();
    }
    async getPublicUserInfo(id) {
        const user = await this.userService.findOneById(id);
        if (!user)
            throw new common_1.NotFoundException();
        return user;
    }
    async banUser(id) {
        console.log('in ban user controler');
        await this.bannedService.banUser(id);
        await this.userService.deleteUser(id);
    }
    async unbanUser(id) {
        console.log('in ban user controler');
        await this.bannedService.unbanUser(id);
    }
    async getUsername(id) {
        const user = await this.userService.findOneById(id);
        if (!user)
            throw new common_1.NotFoundException();
        return user.username;
    }
};
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'User can block or unblock someone' }),
    (0, swagger_1.ApiOkResponse)({ description: 'User blocked/unblocked someone' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Error from the JWT Guard' }),
    (0, swagger_1.ApiInternalServerErrorResponse)({ description: 'Could not save the action to the database' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('/profile/blocked/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseIntPipe({ errorHttpStatusCode: common_1.HttpStatus.NOT_FOUND }))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "addBlocked", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'User can friend or unfriend someone' }),
    (0, swagger_1.ApiOkResponse)({ description: 'User friended/unfriended someone' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'User cannot friend someone that they have blocked' }),
    (0, swagger_1.ApiInternalServerErrorResponse)({ description: 'Could not save the action to the database' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Error from the JWT Guard' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('/profile/friends/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseIntPipe({ errorHttpStatusCode: common_1.HttpStatus.NOT_FOUND }))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "addFriend", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'User can see their friends' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Array of friends is returned' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'The user does not exist' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/profile/friends'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAllFriends", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'User can see who they blocked' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Array of blocked is returned' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'The user does not exist' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/profile/blocked'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAllBlocked", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'User upload an avatar' }),
    (0, swagger_1.ApiOkResponse)({ description: 'The avatar was successfully uploaded' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)('/profile/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("avatar", {
        storage: (0, multer_1.diskStorage)({
            destination: './static',
            filename: (req, file, cb) => {
                const user = req.user;
                cb(null, `${user.id}.jpg`);
            }
        })
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "uploadSingle", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Enable Two-Factor Authenticatiom' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Return a secret for the user' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/profile/enable-2FA'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "returnSecret", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Disable Two-Factor Authentication' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Successfully disabled 2fa' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/profile/disable-2FA'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "disable2fa", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'User can change their username' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Successfully changed their username' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)('/profile/username'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update_name", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify 2FA-token' }),
    (0, swagger_1.ApiOkResponse)({ description: '2FA successfully activated' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Invalid pin, 2fa not activated' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)('/profile/verify-2FA'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "verify_2FA", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'return info on the user logged in' }),
    (0, swagger_1.ApiOkResponse)({ description: 'return the user info' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'user was not found' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getUserProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'delete the user logged in' }),
    (0, swagger_1.ApiOkResponse)({ description: 'the user was successfully deleted' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'the user was not found' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('/profile'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'return infos on all users' }),
    (0, swagger_1.ApiOkResponse)({ description: 'return all users' }),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Admin can delete a user' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'id is not a number' }),
    (0, swagger_1.ApiOkResponse)({ description: 'User successfully deleted' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Delete)('/profile/admin/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseIntPipe({ errorHttpStatusCode: common_1.HttpStatus.BAD_REQUEST }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUserAsAdmin", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'User logs out' }),
    (0, swagger_1.ApiOkResponse)({ description: 'user successfully logged out' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/profile/logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "logout", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get leaderboard' }),
    (0, swagger_1.ApiOkResponse)({ description: 'users returned by ratio' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/leaderboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getLeaderBoard", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get achievements pictures' }),
    (0, swagger_1.ApiOkResponse)({ description: 'An array of path to the pictures is sent' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/achievements'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], UserController.prototype, "getAchievements", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'return some information about a user' }),
    (0, swagger_1.ApiOkResponse)({ description: 'return public user info' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'id is not a number' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'this user does not exist' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseIntPipe({ errorHttpStatusCode: common_1.HttpStatus.BAD_REQUEST }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getPublicUserInfo", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'ban a user' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Post)('/profile/admin/ban/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseIntPipe({ errorHttpStatusCode: common_1.HttpStatus.BAD_REQUEST }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "banUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'unban a user' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Post)('/profile/admin/unban/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseIntPipe({ errorHttpStatusCode: common_1.HttpStatus.BAD_REQUEST }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "unbanUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'unban a user' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/getUsername/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseIntPipe({ errorHttpStatusCode: common_1.HttpStatus.BAD_REQUEST }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsername", null);
UserController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        banned_service_1.BannedService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map