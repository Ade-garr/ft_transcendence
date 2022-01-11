import {
	Injectable,
	HttpStatus,
	UnauthorizedException,
	HttpException
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class TFAStrategy extends PassportStrategy(Strategy, 'jwt-tfa') {
	constructor(private readonly userService: UserService) {
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
		const user = await this.userService.findOneById( payload.id );
		if (!user) throw new UnauthorizedException();
		if ( payload.auth !== false) throw new HttpException('you must authenticate with Google', HttpStatus.UNAUTHORIZED);
		return user;
	}
}