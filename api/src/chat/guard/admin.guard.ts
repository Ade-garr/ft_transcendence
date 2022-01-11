import { InternalServerErrorException } from '@nestjs/common';
import { Injectable, CanActivate } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor() {}

  async canActivate(context: any): Promise<boolean> {
	try {
		const admins: number[] = context.args[1].admins;
		const user = context.args[0].data.user;
		if (user && user.is_admin){
			return true;
		} else if (admins.find(element => element == user.id)) {
			return true;
		}
		return false;
	} catch ( error ) {
		console.log( error );
		throw new InternalServerErrorException('Admin Guard failed');
	}
  }
}
