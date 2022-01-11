import TfaAuthGuard from 'src/auth/tfa.guard';
import { AuthService } from './auth.service';
import { 
	Body,
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards
} from '@nestjs/common';
import { OAuth2AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
	constructor (
		private userService: UserService,
		private jwtService: JwtService,
		private authService: AuthService
	) {}

	@UseGuards(OAuth2AuthGuard)
	@Get('/login')
	login() {}

	@UseGuards(OAuth2AuthGuard)
	@Get('/callback')
	async generateJWT(@Res({passthrough: true}) res: Response, @Req() req: Request) {
		const user = await this.userService.findOneById(req.user['id']);
		if (!user) throw new UnauthorizedException();
		let auth: boolean = user.secret == null ? true: false;
		const accessToken: string = this.jwtService.sign({ id: user.id, auth });
		res.cookie('access_token', accessToken, {httpOnly: true});
		if (auth === false) {
			res.redirect('http://localhost:8080/2fa');
		} else {
			res.redirect('http://localhost:8080/profile');
		}
	}

	@UseGuards(TfaAuthGuard)
	@Post('/validate2FA') 
	async validate_2fa(@Res({passthrough: true}) res: Response, @Req() req, @Body('code') code: string) {
		// console.log('second part of the validation');
		const verify = await this.authService.verify2FAService(req.user.id, code);
		if (!verify) throw new HttpException('Pin entered incorrect, 2FA enabling failed', HttpStatus.FORBIDDEN);
		const accessToken: string = this.jwtService.sign({ id: req.user.id, auth: true });
		res.clearCookie('access_token');
		res.cookie('access_token', accessToken, {httpOnly: true});
	}
}
