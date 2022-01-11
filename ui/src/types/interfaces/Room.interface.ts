import User from '../User'

export default interface RoomI {
    id?: number;
    title: string;
    description?: string;
    users: User[];
    status: string;
    created_at?: Date;
    updated_at?: Date;
    admins: number[];
    bans: number[];
    password?: string;
    owner: string;
}