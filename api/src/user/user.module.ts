import { BannedEntity } from './entities/banned.entity';
import { GameModule } from './../game/game.module';
import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserGateway } from './user.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { BannedService } from './banned.service';

@Module({
  imports: [forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([UserEntity, BannedEntity]),
    GameModule ],  
  controllers: [UserController],
  providers: [UserService, UserGateway, BannedService],
  exports: [UserService, UserGateway, BannedService]
})
export class UserModule {}
