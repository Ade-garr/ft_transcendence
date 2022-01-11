
import GameSumUpI from './interfaces/GameSumUp.interface'

export default class User {
    username = '';
    avatar = '';
    id = '';
    friends = [] as string[];
    blocked = [] as string[];
    is_admin = false;
    victories = 0;
    losses = 0;
    rank = ''
    status = ''
    twoFA = false;
    games = [] as GameSumUpI[]

    constructor(username: string, avatar: string, id: string, 
        friends: string[], blocked: string[], is_admin: boolean,
        victories: number, losses: number, status: string,
        rank: string) {
        this.username = username;
        this.avatar = avatar;
        this.id = id;
        this.friends = friends;
        this.blocked = blocked;
        this.is_admin = is_admin;
        this.victories = victories;
        this.losses = losses;
        this.rank = rank;
        this.status = status;
        this.games = []
    }

    
}
