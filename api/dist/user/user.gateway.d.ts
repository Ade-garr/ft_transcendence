import { AuthService } from './../auth/auth.service';
import { UserService } from 'src/user/user.service';
import { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
export declare class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private userService;
    private authService;
    server: Server;
    constructor(userService: UserService, authService: AuthService);
    handleConnection(socket: Socket): Promise<void>;
    handleDisconnect(socket: Socket): Promise<void>;
    private disconnect;
}
