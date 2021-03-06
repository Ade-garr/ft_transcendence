"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModule = void 0;
const auth_module_1 = require("./../auth/auth.module");
const game_gateway_1 = require("./game.gateway");
const joined_game_entity_1 = require("./entities/joined-game.entity");
const joined_game_service_1 = require("./joined-game.service");
const game_entity_1 = require("./entities/game.entity");
const typeorm_1 = require("@nestjs/typeorm");
const user_module_1 = require("../user/user.module");
const common_1 = require("@nestjs/common");
const game_service_1 = require("./game.service");
const connected_player_entity_1 = require("./entities/connected-player.entity");
const connected_player_service_1 = require("./connected-player.service");
const jwt_1 = require("@nestjs/jwt");
let GameModule = class GameModule {
};
GameModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '36000s' },
            }),
            typeorm_1.TypeOrmModule.forFeature([game_entity_1.GameEntity,
                joined_game_entity_1.JoinedGameEntity,
                connected_player_entity_1.ConnectedPlayerEntity
            ])
        ],
        providers: [game_gateway_1.GameGateway, game_service_1.GameService, joined_game_service_1.JoinedGameService, connected_player_service_1.ConnectedPlayerService],
        exports: [game_gateway_1.GameGateway, game_service_1.GameService],
    })
], GameModule);
exports.GameModule = GameModule;
//# sourceMappingURL=game.module.js.map