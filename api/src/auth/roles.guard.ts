import { InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { forwardRef, Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const user = await this.userService.findOneById(request.user.id);
      if (user && user.is_admin) {
        return user && true;
      }
      return false;
    } catch ( error ) {
      console.log( error );
      throw new InternalServerErrorException('roles guard can activate');
    }
  }
}
