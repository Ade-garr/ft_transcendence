import { BannedEntity } from './user/entities/banned.entity';
import { MuteEntity } from './chat/entities/mute.entity';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { RoomEntity } from './chat/entities/room.entity';
import { MessageEntity } from './chat/entities/message.entity';
import { UserEntity } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { GameModule } from './game/game.module';

@Module({
  imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}), 
		TypeOrmModule.forRoot({
		type: 'postgres',
		host: process.env.POSTGRES_HOST,
		port: parseInt(<string>process.env.POSTGRES_PORT),
		url: process.env.DATABASE_URL,
		username: process.env.POSTGRES_USERNAME,
		password: process.env.POSTGRES_PASSWORD,
		database: process.env.POSTGRES_DB,
		entities: [UserEntity, RoomEntity, MessageEntity, MuteEntity, BannedEntity],
			autoLoadEntities: true,
			synchronize: true,
		}),
		UserModule,
		AuthModule,
		ChatModule,
		GameModule,
	],
	controllers: [UserController],
})

export class AppModule {}
