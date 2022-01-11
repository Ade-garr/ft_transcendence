import { InternalServerErrorException } from '@nestjs/common';
import { Injectable, CanActivate } from '@nestjs/common';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor() {}

  async canActivate(context: any): Promise<boolean> {
	try {
		const user = context.args[0].data.user;
		const roomOwner = context.args[1].owner;
		if (user && (user.is_admin || user.id == roomOwner)) {
			return true;
		}
		return false;
	} catch ( error ) {
		console.log( error );
		throw new InternalServerErrorException('Admin Guard failed');
	}
  }
}
