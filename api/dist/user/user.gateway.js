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
exports.UserGateway = void 0;
const auth_service_1 = require("./../auth/auth.service");
const user_service_1 = require("./user.service");
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const user_entity_1 = require("./entities/user.entity");
const cookie_1 = require("cookie");
let UserGateway = class UserGateway {
    constructor(userService, authService) {
        this.userService = userService;
        this.authService = authService;
    }
    async handleConnection(socket) {
        try {
            const { access_token: token } = (0, cookie_1.parse)(socket.handshake.headers.cookie);
            const decodedToken = await this.authService.verifyJwt(token);
            if (!decodedToken) {
                throw new common_1.UnauthorizedException();
            }
            const user = await this.userService.findOneById(decodedToken.id);
            if (!user) {
                return this.disconnect(socket);
            }
            else {
                await this.userService.updateStatus(user.id, user_entity_1.UserStatus.ONLINE);
                socket.data.user = user;
                this.server.emit('updateStatus', { msg: 'coucou' });
            }
        }
        catch (error) {
            console.log(error);
            await this.disconnect(socket);
        }
    }
    async handleDisconnect(socket) {
        if (socket.data && socket.data.user) {
            const user = await this.userService.findOneById(socket.data.user.id);
            if (user) {
                await this.userService.updateStatus(socket.data.user.id, user_entity_1.UserStatus.OFFLINE);
                this.server.emit('updateStatus');
            }
        }
    }
    async disconnect(socket) {
        socket.emit('error', new common_1.UnauthorizedException());
        socket.disconnect();
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], UserGateway.prototype, "server", void 0);
UserGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: "/connection", cors: { origin: true, credentials: true } }),
    __metadata("design:paramtypes", [user_service_1.UserService,
        auth_service_1.AuthService])
], UserGateway);
exports.UserGateway = UserGateway;
//# sourceMappingURL=user.gateway.js.map