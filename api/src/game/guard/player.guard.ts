import { InternalServerErrorException } from '@nestjs/common';
import { Injectable, CanActivate } from '@nestjs/common';

@Injectable()
export class PlayerGuard implements CanActivate {
  constructor() {}

  async canActivate(context: any): Promise<boolean> {
	try {
		const game = context.args[1];
		const user = context.args[0].data.user;
		if (user.id == game.player1 || user.id == game.player2) {
			return true;
		}
		return false;
	} catch ( error ) {
		console.log( error );
		throw new InternalServerErrorException('Admin Guard failed');
	}
  }
}
