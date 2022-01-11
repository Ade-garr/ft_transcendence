import { OAuth2AuthGuard } from './auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from './jwt.guard';
import { JwtStrategy } from './jwt.strategy';
import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { OAuth2Strategy } from './auth.strategy';
import TfaAuthGuard from './tfa.guard';
import { TFAStrategy } from './tfa.strategy';



@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '36000s'},
    }),
  ],
  providers: [AuthService, OAuth2Strategy, JwtStrategy, JwtAuthGuard, RolesGuard, OAuth2AuthGuard,TfaAuthGuard, TFAStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, JwtAuthGuard, TfaAuthGuard]
})
export class AuthModule {}
