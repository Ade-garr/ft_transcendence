import RoomI from './Room.interface'


export default interface ClientToServerEventsI {
    createRoom: ( roomParam: RoomI) => any;
}
