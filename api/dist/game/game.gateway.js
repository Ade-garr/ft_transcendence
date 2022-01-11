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
exports.GameGateway = void 0;
const user_entity_1 = require("./../user/entities/user.entity");
const jwt_cookie_guard_1 = require("../chat/guard/jwt-cookie.guard");
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const createGameDTO_1 = require("./dto/createGameDTO");
const user_service_1 = require("./../user/user.service");
const auth_service_1 = require("./../auth/auth.service");
const game_service_1 = require("./game.service");
const socket_io_1 = require("socket.io");
const cookie_1 = require("cookie");
const user_interface_1 = require("../user/interfaces/user.interface");
const connected_player_service_1 = require("./connected-player.service");
const game_interface_1 = require("./interfaces/game.interface");
const joined_game_service_1 = require("./joined-game.service");
const gameHeight = 480;
const gameWidth = 650;
const ballRadius = 7;
const paddleWidth = 20;
const paddleHeight = 68;
const pad2X = gameWidth - paddleWidth;
function random_x_start() {
    let x = Math.random() * 0.5 + 0.5;
    let tmp = Math.floor(Math.random() * 2);
    if (tmp == 1)
        return (-x);
    return (x);
}
function multiply_by_x(x, y, mult) {
    return ({ x: x * mult, y: y * mult });
}
function generate_random_start() {
    let x = random_x_start();
    let y = Math.sqrt(1 - x * x);
    let tmp = Math.floor(Math.random() * 2);
    if (tmp == 1)
        y = -y;
    return multiply_by_x(x, y, 10);
}
function ballLeft(x) {
    return (x - ballRadius);
}
function ballRight(x) {
    return (x + ballRadius);
}
function ballTop(y) {
    return (y - ballRadius);
}
function ballBottom(y) {
    return (y + ballRadius);
}
function checkCollision(game) {
    if (ballLeft(game.ball.x) <= 0) {
        game.score2++;
        game.ball.y = gameHeight / 2;
        game.ball.x = gameWidth / 2;
        if (game.score2 == 10) {
            game.status = game_interface_1.GameStatus.PLAYER2WON;
            return "e";
        }
        game.direction = generate_random_start();
        return "s";
    }
    else if (ballRight(game.ball.x) >= gameWidth) {
        game.score1++;
        game.ball.y = gameHeight / 2;
        game.ball.x = gameWidth / 2;
        if (game.score1 == 10) {
            game.status = game_interface_1.GameStatus.PLAYER1WON;
            return "e";
        }
        game.direction = generate_random_start();
        return "s";
    }
    else if (ballLeft(game.ball.x) <= paddleWidth) {
        if (ballTop(game.ball.y) < game.pad1 + paddleHeight && ballBottom(game.ball.y) > game.pad1) {
            game.direction.x = -game.direction.x;
            game.ball.x = paddleWidth + ballRadius + 1;
            game.direction = multiply_by_x(game.direction.x, game.direction.y, game.acceleration);
            return "b";
        }
    }
    else if (ballRight(game.ball.x) >= pad2X) {
        if (ballTop(game.ball.y) < game.pad2 + paddleHeight && ballBottom(game.ball.y) > game.pad2) {
            game.direction.x = -game.direction.x;
            game.ball.x = pad2X - ballRadius - 1;
            game.direction = multiply_by_x(game.direction.x, game.direction.y, game.acceleration);
            return "b";
        }
    }
    else if (game.ball.y - ballRadius <= 0) {
        game.ball.y = ballRadius + 1;
        game.direction.y = -game.direction.y;
        return "b";
    }
    else if (game.ball.y + ballRadius >= gameHeight) {
        game.ball.y = gameHeight - ballRadius - 1;
        game.direction.y = -game.direction.y;
        return "b";
    }
    return "n";
}
let GameGateway = class GameGateway {
    constructor(gameService, authService, userService, connectedPlayerService, joinedGameService) {
        this.gameService = gameService;
        this.authService = authService;
        this.userService = userService;
        this.connectedPlayerService = connectedPlayerService;
        this.joinedGameService = joinedGameService;
        this.idMax = 0;
        this.games = new Map();
        this.queue = [];
        this.gameHeight = 480;
        this.gameWidth = 650;
        this.padStep = this.gameHeight / 10;
        this.halfGameHeight = this.gameHeight / 2;
        this.halfGameWidth = this.gameWidth / 2;
        this.ballRadius = ballRadius;
        this.paddleHeight = 68;
        this.paddleWidth = 20;
        this.paddleOffset = 30;
        this.basePaddleY = this.halfGameHeight - (this.paddleHeight / 2);
        this.basePaddle2X = this.gameWidth - this.paddleWidth - this.paddleOffset;
        this.baseVelocityX = 1;
        this.baseVelocityY = 1;
    }
    async onModuleInit() {
        await this.joinedGameService.deleteAll();
        await this.connectedPlayerService.deleteAll();
    }
    async handleConnection(socket) {
        try {
            const { access_token: token } = (0, cookie_1.parse)(socket.handshake.headers.cookie);
            const decodedToken = await this.authService.verifyJwt(token);
            if (!decodedToken)
                throw new common_1.UnauthorizedException();
            const user = await this.userService.findOneById(decodedToken.id);
            if (!user) {
                return this.disconnect(socket);
            }
            socket.data.user = user;
            await this.connectedPlayerService.create({ socketId: socket.id, user });
            return this.server.to(socket.id).emit('games', this.getGames());
        }
        catch (error) {
            console.log(error);
            this.disconnect(socket);
        }
    }
    async handleDisconnect(socket) {
        await this.connectedPlayerService.deleteBySocketId(socket.id);
        socket.disconnect();
    }
    updatePadPosition(padY, move) {
        let newPadY = padY + move;
        if (newPadY < 0) {
            newPadY = 0;
        }
        else if (newPadY > (this.gameHeight - this.paddleHeight)) {
            newPadY = this.gameHeight - this.paddleHeight;
        }
        return newPadY;
    }
    async onMovePad(socket, event) {
        const game = this.games.get(event.gameId);
        if (!game)
            throw new common_1.NotFoundException();
        if (game.status != game_interface_1.GameStatus.INPROGRESS)
            return;
        let pad = 0;
        let player = 0;
        if (game.player1 == socket.data.user.id) {
            game.pad1 = this.updatePadPosition(game.pad1, event.move);
            pad = game.pad1;
            player = 1;
        }
        else if (game.player2 == socket.data.user.id) {
            game.pad2 = this.updatePadPosition(game.pad2, event.move);
            pad = game.pad2;
            player = 2;
        }
        else
            return;
        const updatedPad = {
            player: player,
            pad: pad,
            gameId: game.id,
        };
        const watchers = await this.joinedGameService.findByGame(event.gameId);
        for (const watcher of watchers) {
            this.server.to(watcher.socketId).emit('updatedPad', updatedPad);
        }
    }
    async onCreateGame(socket, createGame) {
        if (this.playerIsAlreadyInAGame(socket.data.user.id))
            return;
        if (createGame.player2 == -1) {
            if (this.queue.length == 0) {
                const newGame = await this.gameService.createGameI(socket.data.user.id, createGame, this.idMax++);
                this.games.set(newGame.id, newGame);
                this.queue.push(newGame.id);
                this.server.to(socket.id).emit('waiting', newGame);
            }
            else {
                const gameId = this.queue.shift();
                const newGame = this.games.get(gameId);
                newGame.player2 = socket.data.user.id;
                this.games.set(newGame.id, newGame);
                this.server.to(socket.id).emit('waiting', newGame);
            }
        }
        else {
            const newGame = await this.gameService.createGameI(socket.data.user.id, createGame, this.idMax++);
            this.games.set(newGame.id, newGame);
            this.server.to(socket.id).emit('waiting', newGame);
            const connectedUsers = await this.connectedPlayerService.findAll();
            for (const user of connectedUsers) {
                this.server.to(user.socketId).emit('games', this.getGames());
            }
        }
    }
    getGames() {
        const games = Array.from(this.games, ([number, value]) => (value));
        return games;
    }
    playerIsAlreadyInAGame(id) {
        const games = this.getGames();
        for (const game of games) {
            if (game.player1 == id || game.player2 == id) {
                return true;
            }
        }
        return false;
    }
    async onJoinGame(socket, gameId) {
        const game = this.games.get(gameId);
        if (!game)
            throw new common_1.NotFoundException();
        if (game.status == game_interface_1.GameStatus.PLAYER1WON || game.status == game_interface_1.GameStatus.PLAYER2WON) {
            throw new common_1.UnauthorizedException();
        }
        else if (game.status == game_interface_1.GameStatus.INPROGRESS && (socket.data.user.id == game.player1 || socket.data.user.id == game.player2)) {
            throw new common_1.HttpException('you cannot watch your own game. feature to be released in v.4.2', common_1.HttpStatus.FORBIDDEN);
        }
        const user = await this.userService.findOneById(socket.data.user.id);
        if (!game.watchers.find(element => element == user)) {
            game.watchers.push(socket.data.user);
        }
        await this.joinedGameService.create({ socketId: socket.id, user: socket.data.user, gameId: game.id });
        if (game.status == game_interface_1.GameStatus.INCOMPLETE
            && game.watchers.find(element => element.id == game.player1)
            && game.watchers.find(element => element.id == game.player2)) {
            return await this.startGame(game);
        }
        const watchers = await this.joinedGameService.findByGame(game.id);
        for (const watcher of watchers) {
            this.server.to(watcher.socketId).emit('updateGame', game);
        }
    }
    async onLeaveGame(socket, gameId) {
        const game = this.games.get(gameId);
        if (!game)
            throw new common_1.NotFoundException();
        if (game.status == game_interface_1.GameStatus.INPROGRESS
            && (socket.data.user.id == game.player1
                || socket.data.user.id == game.player2)) {
            return await this.terminateGame(game, socket.data.user.id);
        }
        else if (game.status == game_interface_1.GameStatus.INCOMPLETE
            && socket.data.user.id == game.player1) {
            this.games.delete(gameId);
            if (this.queue[0] == gameId)
                this.queue.shift();
        }
        else {
            const watcherIndex = game.watchers.findIndex(element => element == socket.data.user);
            if (watcherIndex != -1) {
                game.watchers.splice(watcherIndex, 1);
            }
        }
        const watchers = await this.joinedGameService.findByGame(game.id);
        for (const watcher of watchers) {
            this.server.to(watcher.socketId).emit('updateGame', game);
        }
    }
    async onGameInfos(socket, gameId) {
        const game = this.games.get(gameId);
        if (!game)
            return;
        const watchers = await this.joinedGameService.findByGame(gameId);
        for (const watcher of watchers) {
            this.server.to(watcher.socketId).emit('gameInfos', game);
        }
    }
    async terminateGame(game, loserId) {
        if (game.player1 == loserId) {
            game.score2 = 10;
            game.status = game_interface_1.GameStatus.PLAYER2WON;
        }
        else {
            game.score1 = 10;
            game.status = game_interface_1.GameStatus.PLAYER1WON;
        }
        const watchers = await this.joinedGameService.findByGame(game.id);
        for (const watcher of watchers) {
            this.server.to(watcher.socketId).emit('endGame', { gameId: game.id, status: game.status });
        }
        return await this.closeGame(game);
    }
    async disconnect(socket) {
        socket.disconnect();
    }
    async closeGame(game) {
        const savedGame = await this.gameService.save(game);
        const player1 = await this.userService.setAchievements(game, game.player1);
        const player2 = await this.userService.setAchievements(game, game.player2);
        player1.games.push(savedGame);
        player2.games.push(savedGame);
        this.userService.updateStatus(game.player1, user_entity_1.UserStatus.ONLINE);
        this.userService.updateStatus(game.player2, user_entity_1.UserStatus.ONLINE);
        const connectedUsers = await this.userService.getUsersWithStatus(user_entity_1.UserStatus.INGAME);
        this.server.emit('onlinePlayers', connectedUsers);
        await this.userService.save(player1);
        await this.userService.save(player2);
    }
    async startGame(game) {
        let moveInterval;
        game.status = game_interface_1.GameStatus.INPROGRESS;
        game.direction = generate_random_start();
        await this.userService.updateStatus(game.player1, user_entity_1.UserStatus.INGAME);
        await this.userService.updateStatus(game.player2, user_entity_1.UserStatus.INGAME);
        const connectedUsers = await this.userService.getUsersWithStatus(user_entity_1.UserStatus.INGAME);
        this.server.emit('onlinePlayers', connectedUsers);
        const watchers = await this.joinedGameService.findByGame(game.id);
        for (const watcher of watchers) {
            this.server.to(watcher.socketId).emit('startGame', game);
        }
        moveInterval = setInterval(async () => {
            game.ball.x += game.direction.x;
            game.ball.y += game.direction.y;
            let ret = checkCollision(game);
            if (ret == "n")
                return;
            else if (ret == "b") {
                const watchers = await this.joinedGameService.findByGame(game.id);
                for (const watcher of watchers) {
                    this.server.to(watcher.socketId).emit('updateBall', { gameId: game.id, ball: game.ball, direction: game.direction });
                }
            }
            if (ret == "s") {
                const watchers = await this.joinedGameService.findByGame(game.id);
                for (const watcher of watchers) {
                    this.server.to(watcher.socketId).emit('updateScore', { gameId: game.id, score1: game.score1, score2: game.score2, ball: game.ball, direction: game.direction });
                }
            }
            else if (ret == "e") {
                this.closeGame(game);
                const watchers = await this.joinedGameService.findByGame(game.id);
                for (const watcher of watchers) {
                    this.server.to(watcher.socketId).emit('endGame', { gameId: game.id, status: game.status });
                }
                clearInterval(moveInterval);
                this.games.delete(game.id);
                this.server.emit('games', this.getGames());
            }
            else if (game.status != game_interface_1.GameStatus.INPROGRESS) {
                clearInterval(moveInterval);
                this.games.delete(game.id);
                this.server.emit('games', this.getGames());
            }
        }, 34);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie),
    (0, websockets_1.SubscribeMessage)('onMovePad'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "onMovePad", null);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie),
    (0, websockets_1.SubscribeMessage)('onCreateGame'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, createGameDTO_1.createGameDTO]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "onCreateGame", null);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie),
    (0, websockets_1.SubscribeMessage)('onJoinGame'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "onJoinGame", null);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie),
    (0, websockets_1.SubscribeMessage)('leaveGame'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "onLeaveGame", null);
__decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtSocketCookie),
    (0, websockets_1.SubscribeMessage)('onGameInfos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "onGameInfos", null);
GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: '/game', cors: { origin: true, credentials: true } }),
    __metadata("design:paramtypes", [game_service_1.GameService,
        auth_service_1.AuthService,
        user_service_1.UserService,
        connected_player_service_1.ConnectedPlayerService,
        joined_game_service_1.JoinedGameService])
], GameGateway);
exports.GameGateway = GameGateway;
//# sourceMappingURL=game.gateway.js.map