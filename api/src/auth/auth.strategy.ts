import { BannedService } from './../user/banned.service';
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { Strategy, Profile } from "passport-42";

@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy, 'OAuth2') {
    constructor(
        private readonly authService: AuthService,
        private readonly bannedService: BannedService,
        ) {
        super({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
            profileFields: {
                'id': 'id',
                'username': 'login',
                'photos.0.value': 'image_url'
              },
        });
    }


    async validate(accessToken: string, refreshToken: string, profile: Profile) {
        const { username } = profile;
        const user = {
            id: parseInt(profile.id),
            username: username,
            avatar: profile['photos'][0]['value'],
        };
        const isBan = await this.bannedService.isBan(user.id);
        if (isBan) {
            return false;
        }
        return await this.authService.findOrCreate(user);
    }
}