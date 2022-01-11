"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const mute_service_1 = require("./mute.service");
const mute_entity_1 = require("./entities/mute.entity");
const message_service_1 = require("./message.service");
const joined_room_service_1 = require("./joined-room.service");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("../auth/auth.module");
const user_module_1 = require("../user/user.module");
const chat_gateway_1 = require("./chat.gateway");
const connected_user_service_1 = require("./connected-user.service");
const connected_user_entity_1 = require("./entities/connected-user.entity");
const message_entity_1 = require("./entities/message.entity");
const room_entity_1 = require("./entities/room.entity");
const room_service_1 = require("./room.service");
const joined_room_entity_1 = require("./entities/joined-room.entity");
const jwt_1 = require("@nestjs/jwt");
let ChatModule = class ChatModule {
};
ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule,
            user_module_1.UserModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '36000s' },
            }),
            typeorm_1.TypeOrmModule.forFeature([
                room_entity_1.RoomEntity,
                connected_user_entity_1.ConnectedUserEntity,
                message_entity_1.MessageEntity,
                joined_room_entity_1.JoinedRoomEntity,
                mute_entity_1.MuteEntity,
            ])
        ],
        providers: [chat_gateway_1.ChatGateway, room_service_1.RoomService, connected_user_service_1.ConnectedUserService, joined_room_service_1.JoinedRoomService, message_service_1.MessageService, mute_service_1.MuteService],
        exports: [chat_gateway_1.ChatGateway, room_service_1.RoomService, connected_user_service_1.ConnectedUserService, joined_room_service_1.JoinedRoomService, message_service_1.MessageService, mute_service_1.MuteService]
    })
], ChatModule);
exports.ChatModule = ChatModule;
//# sourceMappingURL=chat.module.js.map