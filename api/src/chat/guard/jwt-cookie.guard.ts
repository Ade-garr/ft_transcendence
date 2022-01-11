import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CanActivate, Injectable } from '@nestjs/common';
import { parse } from 'cookie';

@Injectable()
export class JwtSocketCookie implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) {}

    async canActivate(context: any): Promise<boolean> {
		const cookie = context.args[0].handshake.headers['cookie'];
		const { access_token : token } = parse(cookie);
		const payload = this.jwtService.verify(token, {secret: process.env.SECRET_JWT});
		const { username } = payload;
		const user: UserEntity = await this.userService.findOneByUsername( username );

    if (payload['auth'] === false && user.secret != null) {
          return false;
    }
    return true;
    }
}