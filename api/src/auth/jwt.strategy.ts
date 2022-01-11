import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/entities/user.entity';
import { BannedService } from 'src/user/banned.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly userService: UserService,
		private readonly bannedService: BannedService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					let accessToken = request?.cookies['access_token'];
					return accessToken;
				}
			]),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET,
		});
	}
	
	async validate(payload: any): Promise<UserEntity> {
		const isBan = await this.bannedService.isBan(parseInt(payload.id));
		if (isBan) {
			throw new UnauthorizedException('is banned');
		}
		const user = await this.userService.findOneById( payload.id );
		if ( user == undefined) throw new UnauthorizedException();
		if ( payload.auth == false) throw new UnauthorizedException();
		return user;
	}
}