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
exports.RoomEntity = exports.RoomStatus = void 0;
const swagger_1 = require("@nestjs/swagger");
const mute_entity_1 = require("./mute.entity");
const user_entity_1 = require("../../user/entities/user.entity");
const joined_room_entity_1 = require("./joined-room.entity");
const typeorm_1 = require("typeorm");
const message_entity_1 = require("./message.entity");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var RoomStatus;
(function (RoomStatus) {
    RoomStatus["PUBLIC"] = "public";
    RoomStatus["PRIVATE"] = "private";
    RoomStatus["PROTECTED"] = "protected";
})(RoomStatus = exports.RoomStatus || (exports.RoomStatus = {}));
let RoomEntity = class RoomEntity {
};
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RoomEntity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 30),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RoomEntity.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.OneToMany)(() => message_entity_1.MessageEntity, message => message.room, { cascade: true }),
    __metadata("design:type", Array)
], RoomEntity.prototype, "messages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.OneToMany)(() => joined_room_entity_1.JoinedRoomEntity, joinedRoom => joinedRoom.room, { cascade: true }),
    __metadata("design:type", Array)
], RoomEntity.prototype, "joinedUsers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.ManyToMany)(() => user_entity_1.UserEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], RoomEntity.prototype, "users", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({
        type: "enum",
        enum: RoomStatus,
        default: RoomStatus.PUBLIC,
    }),
    __metadata("design:type", String)
], RoomEntity.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.Column)({ nullable: true, default: null }),
    __metadata("design:type", String)
], RoomEntity.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RoomEntity.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RoomEntity.prototype, "updated_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], RoomEntity.prototype, "owner", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)("simple-array", { default: [] }),
    __metadata("design:type", Array)
], RoomEntity.prototype, "admins", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)("simple-array", { default: [] }),
    __metadata("design:type", Array)
], RoomEntity.prototype, "bans", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.OneToMany)(() => mute_entity_1.MuteEntity, mutes => mutes.room, { cascade: true }),
    __metadata("design:type", Array)
], RoomEntity.prototype, "mutes", void 0);
RoomEntity = __decorate([
    (0, typeorm_1.Entity)('room')
], RoomEntity);
exports.RoomEntity = RoomEntity;
//# sourceMappingURL=room.entity.js.map