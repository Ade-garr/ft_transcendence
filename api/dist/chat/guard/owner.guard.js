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
exports.OwnerGuard = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
let OwnerGuard = class OwnerGuard {
    constructor() { }
    async canActivate(context) {
        try {
            const user = context.args[0].data.user;
            const roomOwner = context.args[1].owner;
            if (user && (user.is_admin || user.id == roomOwner)) {
                return true;
            }
            return false;
        }
        catch (error) {
            console.log(error);
            throw new common_1.InternalServerErrorException('Admin Guard failed');
        }
    }
};
OwnerGuard = __decorate([
    (0, common_2.Injectable)(),
    __metadata("design:paramtypes", [])
], OwnerGuard);
exports.OwnerGuard = OwnerGuard;
//# sourceMappingURL=owner.guard.js.map