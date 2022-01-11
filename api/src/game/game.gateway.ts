import { UserStatus } from './../user/entities/user.entity';
import { JwtSocketCookie } from 'src/chat/guard/jwt-cookie.guard';
import { 
  HttpException,
  HttpStatus,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { OnGatewayDisconnect,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { createGameDTO } from './dto/createGameDTO';
import { ConnectedPlayerI } from './interfaces/connected-player.interface';
import { UserService } from './../user/user.service';
import { AuthService } from './../auth/auth.service';
import { GameService } from './game.service';
import { Server, Socket } from 'socket.io';
import { parse } from 'cookie';
import { UserI } from 'src/user/interfaces/user.interface';
import { ConnectedPlayerService } from './connected-player.service';
import { GameI, GameStatus } from './interfaces/game.interface';
import { JoinedGameService } from './joined-game.service';
import { JoinedGameI } from './interfaces/joined-game.interface';
import { UpdatePadI } from './interfaces/update-pad.interface';

const gameHeight = 480;
const gameWidth =  650;
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

function multiply_by_x(x: number, y: number, mult: number) {
  return ({x: x * mult, y: y * mult})
}

function generate_random_start() {
  let x = random_x_start();
  let y = Math.sqrt(1 - x * x);
  let tmp = Math.floor(Math.random() * 2);
  if (tmp == 1)
  y = -y;
  return multiply_by_x(x, y, 10);
}

function ballLeft(x: number) {
  return (x - ballRadius);
}

function ballRight(x: number) {
  return (x + ballRadius);
}

function ballTop(y: number) {
  return (y - ballRadius);
}

function ballBottom(y: number) {
  return (y + ballRadius);
}


function checkCollision(game: GameI) {
  
  if (ballLeft(game.ball.x) <= 0) {
    game.score2++;
      game.ball.y = gameHeight / 2;
      game.ball.x = gameWidth / 2;
      if (game.score2 == 10) {
        game.status = GameStatus.PLAYER2WON;
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
        game.status = GameStatus.PLAYER1WON;
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
      return  "b";
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

  return "n"
}



@WebSocketGateway({ namespace: '/game' , cors: { origin: true, credentials: true }})
export class GameGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;


  idMax = 0;
  games = new Map<number, GameI>();
  queue = [];
  gameHeight = 480;
  gameWidth =  650; 
  padStep = this.gameHeight / 10;
  halfGameHeight = this.gameHeight / 2;
  halfGameWidth = this.gameWidth / 2;
  ballRadius = ballRadius;
  paddleHeight = 68;
  paddleWidth = 20;
  paddleOffset = 30;
  basePaddleY = this.halfGameHeight - (this.paddleHeight / 2);
  basePaddle2X = this.gameWidth - this.paddleWidth - this.paddleOffset;
  baseVelocityX = 1;
  baseVelocityY = 1;

  constructor(
    private gameService: GameService,
    private readonly authService: AuthService,
    private userService: UserService,
    private connectedPlayerService: ConnectedPlayerService,
    private joinedGameService: JoinedGameService,
  ) {}

  async onModuleInit() {
    await this.joinedGameService.deleteAll();
    await this.connectedPlayerService.deleteAll();
  }

  async handleConnection(socket: Socket) {
    try {
      const { access_token: token } = parse( socket.handshake.headers.cookie );
      const decodedToken = await this.authService.verifyJwt( token );
      if ( !decodedToken ) throw new UnauthorizedException();
      const user: UserI = await this.userService.findOneById(decodedToken.id);
      if ( !user ) { return this.disconnect(socket);}
      socket.data.user = user;
      await this.connectedPlayerService.create({ socketId: socket.id, user });
      return this.server.to(socket.id).emit('games', this.getGames());
    } catch ( error ) {
      console.log( error );
      this.disconnect(socket);
    }
  }

  async handleDisconnect( socket: Socket) {
    await this.connectedPlayerService.deleteBySocketId(socket.id);
    socket.disconnect();
  }

  private updatePadPosition(padY: number, move: number): number {
    let newPadY = padY + move;
    if (newPadY < 0) {
      newPadY = 0;
    } else if (newPadY > (this.gameHeight - this.paddleHeight) ) {
      newPadY = this.gameHeight - this.paddleHeight;
    }
    return newPadY;
  }

  @UseGuards(JwtSocketCookie)
  @SubscribeMessage('onMovePad')
  async onMovePad(socket: Socket, event :{ gameId: number, move: number }) {
    const game = this.games.get(event.gameId);
    if (!game) throw new NotFoundException();
    if (game.status != GameStatus.INPROGRESS)
      return;
    let pad = 0;
    let player = 0;
    if (game.player1 == socket.data.user.id) {
      game.pad1 = this.updatePadPosition(game.pad1, event.move);
      pad = game.pad1;
      player = 1;
    } else if (game.player2 == socket.data.user.id) {
      game.pad2 = this.updatePadPosition(game.pad2, event.move);
      pad = game.pad2;
      player = 2;
    }
    else 
      return ;
    const updatedPad: UpdatePadI = {
      player: player,
      pad: pad,
      gameId: game.id,
    };
    const watchers: JoinedGameI[] = await this.joinedGameService.findByGame(event.gameId);
    for (const watcher of watchers) {
      this.server.to(watcher.socketId).emit('updatedPad', updatedPad);
    }
  }
  @UseGuards(JwtSocketCookie)
  @SubscribeMessage('onCreateGame')
  async onCreateGame(socket: Socket, createGame: createGameDTO) {
    if ( this.playerIsAlreadyInAGame(socket.data.user.id))
      return ;
    if (createGame.player2 == -1) {
      if (this.queue.length == 0) {
        const newGame: GameI = await this.gameService.createGameI(socket.data.user.id, createGame, this.idMax++);
        this.games.set(newGame.id, newGame);
        this.queue.push(newGame.id);
        this.server.to(socket.id).emit('waiting', newGame);
      } else {
        const gameId = this.queue.shift();
        const newGame = this.games.get(gameId);
        newGame.player2 = socket.data.user.id;
        this.games.set(newGame.id, newGame);
        this.server.to(socket.id).emit('waiting', newGame);
      }
    } else {
      const newGame: GameI = await this.gameService.createGameI(socket.data.user.id, createGame, this.idMax++);
      this.games.set(newGame.id, newGame);
      this.server.to(socket.id).emit('waiting', newGame);
      const connectedUsers : ConnectedPlayerI[] = await this.connectedPlayerService.findAll();
      for (const user of connectedUsers) {
        this.server.to(user.socketId).emit('games', this.getGames());
      }
    }
  }

  private getGames() : GameI[] {
    const games = Array.from(this.games, ([number, value]) => (value))
    return games
  }

  private playerIsAlreadyInAGame(id: number): boolean {
    const games = this.getGames();

    for (const game of games) {
      if (game.player1 == id || game.player2 == id) {
        return true;
      }
    }
    return false;
  }

  @UseGuards(JwtSocketCookie)
  @SubscribeMessage('onJoinGame')
  async onJoinGame(socket: Socket, gameId: number) {
    const game = this.games.get(gameId);
    if (!game) throw new NotFoundException();
    if (game.status == GameStatus.PLAYER1WON || game.status == GameStatus.PLAYER2WON) {
      throw new UnauthorizedException();
    } else if (game.status == GameStatus.INPROGRESS && (socket.data.user.id == game.player1 || socket.data.user.id == game.player2 )) {
      throw new HttpException('you cannot watch your own game. feature to be released in v.4.2', HttpStatus.FORBIDDEN);
    }
    const user: UserI = await this.userService.findOneById(socket.data.user.id);
    if (!game.watchers.find( element => element == user)) {
      game.watchers.push( socket.data.user );
    }
    await this.joinedGameService.create({ socketId: socket.id, user: socket.data.user, gameId: game.id});
    if (game.status == GameStatus.INCOMPLETE
    && game.watchers.find( element => element.id == game.player1)
    && game.watchers.find( element => element.id == game.player2 )) {
      return await this.startGame(game);
    }
    const watchers: JoinedGameI[] = await this.joinedGameService.findByGame(game.id);
    for (const watcher of watchers) {
      this.server.to(watcher.socketId).emit('updateGame', game);
    }
  }

  @UseGuards(JwtSocketCookie)
  @SubscribeMessage('leaveGame')
  async onLeaveGame(socket: Socket, gameId: number) {
    const game = this.games.get(gameId);
    if (!game) throw new NotFoundException();
    if (game.status == GameStatus.INPROGRESS
      && (socket.data.user.id == game.player1 
      || socket.data.user.id == game.player2 )) {
      return await this.terminateGame(game, socket.data.user.id);
    } else if (game.status == GameStatus.INCOMPLETE
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

  @UseGuards(JwtSocketCookie)
  @SubscribeMessage('onGameInfos')
  async onGameInfos(socket: Socket, gameId: number) {
    const game: GameI = this.games.get(gameId);
    if (!game)  return ;
    const watchers: JoinedGameI[] = await this.joinedGameService.findByGame(gameId);
    for (const watcher of watchers) {
      this.server.to(watcher.socketId).emit('gameInfos', game);
    }
  }

  private async terminateGame(game: GameI, loserId: number) {
    if (game.player1 == loserId) {
      game.score2 = 10;
      game.status = GameStatus.PLAYER2WON;
    } else {
      game.score1 = 10;
      game.status = GameStatus.PLAYER1WON;
    }
    const watchers: JoinedGameI[] = await this.joinedGameService.findByGame(game.id);
    for (const watcher of watchers) {
      this.server.to(watcher.socketId).emit('endGame', { gameId: game.id, status: game.status });
    }
    return await this.closeGame(game);
  }

  private async disconnect(socket: Socket) {
    socket.disconnect();
  }

  async closeGame(game: GameI) {
    const savedGame = await this.gameService.save(game);
    const player1 = await this.userService.setAchievements(game, game.player1);
    const player2 = await this.userService.setAchievements(game, game.player2);

    player1.games.push( savedGame );
    player2.games.push( savedGame );
    
    this.userService.updateStatus(game.player1, UserStatus.ONLINE);
    this.userService.updateStatus(game.player2, UserStatus.ONLINE);
    const connectedUsers = await this.userService.getUsersWithStatus(UserStatus.INGAME);
    this.server.emit('onlinePlayers', connectedUsers);
    await this.userService.save(player1);
    await this.userService.save(player2);
  }

  async startGame(game: GameI) {
    let moveInterval : NodeJS.Timer;
    game.status = GameStatus.INPROGRESS;
    game.direction = generate_random_start();
    await this.userService.updateStatus(game.player1, UserStatus.INGAME);
    await this.userService.updateStatus(game.player2, UserStatus.INGAME);
    const connectedUsers = await this.userService.getUsersWithStatus(UserStatus.INGAME);
    this.server.emit('onlinePlayers', connectedUsers);
    const watchers: JoinedGameI[] = await this.joinedGameService.findByGame(game.id);
    for (const watcher of watchers) {
      this.server.to(watcher.socketId).emit('startGame', game);
    }
    moveInterval = setInterval( async () => { 
      game.ball.x += game.direction.x;
      game.ball.y += game.direction.y;
      let ret = checkCollision(game)
        if (ret == "n")
          return ;
        else if (ret == "b") {
          const watchers: JoinedGameI[] = await this.joinedGameService.findByGame(game.id);
          for (const watcher of watchers) {
            this.server.to(watcher.socketId).emit('updateBall', { gameId: game.id, ball: game.ball, direction: game.direction});
          }
        }
        if (ret == "s"){
          const watchers: JoinedGameI[] = await this.joinedGameService.findByGame(game.id);
            for (const watcher of watchers) {
              this.server.to(watcher.socketId).emit('updateScore', { gameId: game.id, score1: game.score1, score2: game.score2, ball: game.ball, direction: game.direction });
            }
        } 
        else if (ret == "e") {
            this.closeGame(game);
            const watchers: JoinedGameI[] = await this.joinedGameService.findByGame(game.id);
            for (const watcher of watchers) {
              this.server.to(watcher.socketId).emit('endGame', { gameId: game.id, status: game.status });
            }
            clearInterval(moveInterval);
            this.games.delete(game.id);
            this.server.emit('games', this.getGames())
        } 
        else if (game.status != GameStatus.INPROGRESS) {
          
          clearInterval(moveInterval);
          this.games.delete(game.id);
          this.server.emit('games', this.getGames())
        }
    }, 34);
  }
}
