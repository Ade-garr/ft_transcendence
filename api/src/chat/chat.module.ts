import { MuteService } from './mute.service';
import { MuteEntity } from './entities/mute.entity';
import { MessageService } from './message.service';
import { JoinedRoomService } from './joined-room.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { ChatGateway } from './chat.gateway';
import { ConnectedUserService } from './connected-user.service';
import { ConnectedUserEntity } from './entities/connected-user.entity';
import { MessageEntity } from './entities/message.entity';
import { RoomEntity } from './entities/room.entity';
import { RoomService } from './room.service';
import { JoinedRoomEntity } from './entities/joined-room.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [AuthModule,
            UserModule,
            JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '36000s'},
            }),          
            TypeOrmModule.forFeature([
                RoomEntity,
                ConnectedUserEntity,
                MessageEntity,
                JoinedRoomEntity,
                MuteEntity,
            ]) 
    ],
    providers: [ChatGateway, RoomService, ConnectedUserService, JoinedRoomService, MessageService, MuteService],
    exports: [ChatGateway, RoomService, ConnectedUserService, JoinedRoomService, MessageService, MuteService]
})
export class ChatModule {}
