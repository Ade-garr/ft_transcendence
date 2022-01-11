import { BannedService } from './../user/banned.service';
import { AuthService } from "./auth.service";
import { Profile } from "passport-42";
declare const OAuth2Strategy_base: new (...args: any[]) => any;
export declare class OAuth2Strategy extends OAuth2Strategy_base {
    private readonly authService;
    private readonly bannedService;
    constructor(authService: AuthService, bannedService: BannedService);
    validate(accessToken: string, refreshToken: string, profile: Profile): Promise<false | import("../user/entities/user.entity").UserEntity>;
}
export {};
