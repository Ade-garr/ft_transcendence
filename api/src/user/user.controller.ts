import { JwtAuthGuard } from '../auth/jwt.guard';
import {
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Param,
  Delete, 
  HttpStatus,
  ParseIntPipe,
  Req,
  Body, 
  UseGuards,
  UseInterceptors,
  HttpCode,
  UploadedFile,
  HttpException,
  NotFoundException,
  Res
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity';
import { RolesGuard } from 'src/auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UserI } from './interfaces/user.interface';
import { Response } from 'express';
import { BannedService } from './banned.service';


@Controller('users')
export class UserController {
  constructor( private readonly userService: UserService,
    private readonly bannedService: BannedService
    ) {}

  @ApiOperation({summary: 'User can block or unblock someone' })
  @ApiOkResponse({description: 'User blocked/unblocked someone'})
  @ApiUnauthorizedResponse({description: 'Error from the JWT Guard'})
  @ApiInternalServerErrorResponse({description: 'Could not save the action to the database'})
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('/profile/blocked/:id')
  async addBlocked(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND })) id: number, @Req() req): Promise<void> {
    const user = await this.userService.findOneById(req.user.id);
    return await this.userService.addOrRemoveBlocked(user, id);
  }

  @ApiOperation({summary: 'User can friend or unfriend someone'})
  @ApiOkResponse({description: 'User friended/unfriended someone'})
  @ApiForbiddenResponse({description: 'User cannot friend someone that they have blocked'})
  @ApiInternalServerErrorResponse({description: 'Could not save the action to the database'})
  @ApiUnauthorizedResponse({description: 'Error from the JWT Guard'})
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('/profile/friends/:id')
  async addFriend(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND })) id: number, @Req() req): Promise<void> {
    const user = await this.userService.findOneById(req.user.id);
    return await this.userService.addOrRemoveFriend(user, id);
  }


  @ApiOperation({summary: 'User can see their friends'})
  @ApiOkResponse({description: 'Array of friends is returned'})
  @ApiUnauthorizedResponse({description: 'The user does not exist'})
  @UseGuards(JwtAuthGuard)
  @Get('/profile/friends')
  async findAllFriends(@Req() req): Promise<UserEntity[]> {
    return await this.userService.findAllFriends(req.user.id);
  }

  @ApiOperation({summary: 'User can see who they blocked'})
  @ApiOkResponse({description: 'Array of blocked is returned'})
  @ApiUnauthorizedResponse({description: 'The user does not exist'})
  @UseGuards(JwtAuthGuard)
  @Get('/profile/blocked')
  async findAllBlocked(@Req() req): Promise<UserEntity[]> {
    return await this.userService.findAllBlocked(req.user.id);
  }

  @ApiOperation({summary: 'User upload an avatar'})
  @ApiOkResponse({description: 'The avatar was successfully uploaded'})
  @UseGuards(JwtAuthGuard)
  @Post('/profile/upload')
  @UseInterceptors( 
    FileInterceptor("avatar", {
      storage: diskStorage({
        destination: './static',
        filename: (req, file, cb) => {
          const user : UserI = req.user;
          cb(null, `${user.id}.jpg`)
        }
      })
    })
  )

  async uploadSingle(@UploadedFile() file: Express.Multer.File, @Req() req) {
    await this.userService.updateAvatar(req.user.id);
  }

  @ApiOperation({summary: 'Enable Two-Factor Authenticatiom'})
  @ApiOkResponse({description: 'Return a secret for the user'})
  @UseGuards(JwtAuthGuard)
  @Get('/profile/enable-2FA')
  async returnSecret(@Req() req) {
    const url = await this.userService.createSecret(req.user.id);
    return ({ url: url });
  }

  @ApiOperation({summary: 'Disable Two-Factor Authentication'})
  @ApiOkResponse({description: 'Successfully disabled 2fa'})
  @UseGuards(JwtAuthGuard)
  @Get('/profile/disable-2FA')
  async disable2fa(@Req() req) {
    await this.userService.eraseSecret(req.user.id);
  }

  @ApiOperation({summary: 'User can change their username'})
  @ApiOkResponse({description: 'Successfully changed their username'})
  @UseGuards(JwtAuthGuard)
  @Post('/profile/username')
  async update_name(@Req() req): Promise<void>  {
    await this.userService.changeUsername(req.user, req.body.username)
  }

  @ApiOperation({summary: 'Verify 2FA-token'})
  @ApiOkResponse({description: '2FA successfully activated'})
  @ApiForbiddenResponse({description: 'Invalid pin, 2fa not activated'})
  @UseGuards(JwtAuthGuard)
  @Post('/profile/verify-2FA')
  async verify_2FA(@Req() req, @Body('code') code: string) {
    const verify = await this.userService.verify2FAService(req.user.id, code)
    if (!verify) throw new HttpException('Pin entered incorrect, 2FA enabling failed', HttpStatus.FORBIDDEN);
    await this.userService.updateSecret(req.user.id);
    const user = await this.userService.findOneById(req.user.id);
  }

  @ApiOperation({summary: 'return info on the user logged in'})
  @ApiOkResponse({description: 'return the user info'})
  @ApiNotFoundResponse({description: 'user was not found'})
  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getUserProfile(@Req() req) {
    return req.user;
  }
  
  @ApiOperation({summary: 'delete the user logged in'})
  @ApiOkResponse({description: 'the user was successfully deleted'})
  @ApiNotFoundResponse({description: 'the user was not found'})
  @UseGuards(JwtAuthGuard)
  @Delete('/profile')
  async deleteUser(@Res({ passthrough: true}) res: Response, @Req() req): Promise<void> {
    await this.userService.deleteUser(req.user.id);
    res.clearCookie('access_token');
  }


  @ApiOperation({summary: 'return infos on all users'})
  @ApiOkResponse({description: 'return all users'})
  @Get()
  async findAll(): Promise<UserEntity[]> {
    return await this.userService.findAll(); //TODO: voir si je peux return que les infos public
  }

  @ApiOperation({summary: 'Admin can delete a user'})
  @ApiNotFoundResponse({description: 'id is not a number'})
  @ApiOkResponse({description: 'User successfully deleted'})
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/profile/admin/:id')
  async deleteUserAsAdmin(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: number) {
    await this.userService.deleteUser(id);
  }

  @ApiOperation({ summary: 'User logs out'})
  @ApiOkResponse({ description: 'user successfully logged out'})
  @UseGuards(JwtAuthGuard)
  @Get('/profile/logout')
  async logout(@Res({ passthrough: true}) res: Response) {
    res.clearCookie('access_token');
  }

  @ApiOperation({ summary: 'Get leaderboard'})
  @ApiOkResponse({ description: 'users returned by ratio'})
  @UseGuards(JwtAuthGuard)
  @Get('/leaderboard')
  async getLeaderBoard(): Promise<UserEntity[]> {
    return await this.userService.getLeaderboard();
  }

  @ApiOperation({ summary: 'Get achievements pictures'})
  @ApiOkResponse({ description: 'An array of path to the pictures is sent'})
  @UseGuards(JwtAuthGuard)
  @Get('/achievements')
  getAchievements() : string[] {
    return this.userService.getAchievements();
  }

  @ApiOperation({summary: 'return some information about a user'})
  @ApiOkResponse({description: 'return public user info'})
  @ApiBadRequestResponse({ description: 'id is not a number'})
  @ApiNotFoundResponse({description: 'this user does not exist'})
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getPublicUserInfo(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: number) {
    const user = await this.userService.findOneById(id);
    if (!user) throw new NotFoundException();
    return user;
  }

  @ApiOperation({ summary: 'ban a user'})
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/profile/admin/ban/:id') 
  async banUser(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST})) id: number) {
    console.log('in ban user controler');
    await this.bannedService.banUser(id);
    await this.userService.deleteUser(id);
  }

  @ApiOperation({ summary: 'unban a user'})
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/profile/admin/unban/:id') 
  async unbanUser(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST})) id: number) {
    console.log('in ban user controler');
    await this.bannedService.unbanUser(id);
  }

  @ApiOperation({ summary: 'unban a user'})
  @UseGuards(JwtAuthGuard)
  @Get('/getUsername/:id') 
  async getUsername(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST})) id: number): Promise<string> {
    const user = await this.userService.findOneById(id);
    if (!user) throw new NotFoundException();
    return user.username;
  }
}
