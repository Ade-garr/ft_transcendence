import { AuthService } from './../auth/auth.service';
import { UserService } from 'src/user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { UserStatus } from './entities/user.entity';
import { parse } from 'cookie';
import { UserI } from './interfaces/user.interface';

@WebSocketGateway({ namespace: "/connection", cors: { origin: true, credentials: true }})
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() server: Server;

	constructor(
		private userService: UserService,
		private authService: AuthService,
	) {}

	async handleConnection(socket: Socket) {
		try {
			const { access_token : token } = parse(socket.handshake.headers.cookie );
			const decodedToken = await this.authService.verifyJwt( token );
			if (!decodedToken) {
				throw new UnauthorizedException();
			}
			const user: UserI = await this.userService.findOneById(decodedToken.id);
			if (!user) {
				return this.disconnect(socket);
			} else {
				await this.userService.updateStatus(user.id, UserStatus.ONLINE);
				socket.data.user = user;
				this.server.emit('updateStatus',{ msg: 'coucou'});
			}
		} catch ( error ) {
			console.log( error );
			await this.disconnect(socket);
		}
	}
	
	async handleDisconnect(socket: Socket) {
		if (socket.data && socket.data.user){
			const user = await this.userService.findOneById(socket.data.user.id);
			if (user) {
				await this.userService.updateStatus(socket.data.user.id, UserStatus.OFFLINE);
				this.server.emit('updateStatus');
			}
		}
	}

	private async disconnect(socket: Socket) {
		socket.emit('error', new UnauthorizedException());
		socket.disconnect();
	}
 }