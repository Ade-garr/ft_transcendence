import { AuthModule } from './../auth/auth.module';
import { GameGateway } from './game.gateway';
import { JoinedGameEntity } from 'src/game/entities/joined-game.entity';
import { JoinedGameService } from './joined-game.service';
import { GameEntity } from 'src/game/entities/game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { GameService } from './game.service';
import { ConnectedPlayerEntity } from './entities/connected-player.entity';
import { ConnectedPlayerService } from './connected-player.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ 
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '36000s'},
  }),          
    TypeOrmModule.forFeature([GameEntity,
    JoinedGameEntity,
    ConnectedPlayerEntity
  ])],
  providers: [GameGateway, GameService, JoinedGameService, ConnectedPlayerService],
  exports: [GameGateway, GameService],
})
export class GameModule {}
