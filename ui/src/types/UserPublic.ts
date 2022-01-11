export default class User {
    username = '';
    avatar = '';
    id = '';
    is_admin = false;

    constructor(username: string, avatar: string, id: string, 
        is_admin: boolean, status: string) {
        this.username = username;
        this.avatar = avatar;
        this.id = id;
        this.is_admin = is_admin;
    }

    
}
