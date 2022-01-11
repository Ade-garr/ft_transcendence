<template>
    <div id="chat_global">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        <div id="left_side">
            <div class="switching">
                <button @click="changeModeLeft('room_listing') " ><i class="fa fa-bars"> </i></button>
                <button @click="changeModeLeft('room_creation') "><i class="fa fa-plus"> </i></button>
            </div>
            
            <div class="left_side_bottom">
                <CreateChat v-if="this.modeLeft != 'room_listing'" @create-chat="createChat" :user="user"  :userid="user.id"/>
                <ChatsListing v-else @join-room="joinRoom" :rooms="rooms" :roomSelected="roomSelected.id"/>
            </div>
        </div>
        <div id="right_side">
            <div class="switching">
                <button v-if="(isAdmin(user.id) || isOwner(user.id))" @click="changeModeRight('admin') "><i class="fa fa-cog"></i></button>
                <button @click="changeModeRight('room') "><i class="fa fa-comments"></i></button>
                <button v-if="roomSelected.id != -1" @click="unjoinRoom"><i class="fa fa-sign-out"> </i></button>
            </div>
            <div class="right_side_bottom">
                <ChatAdmin @change-room="this.roomSelected.id = -1" v-if="this.modeRight == 'admin'" :user="user" :roomSelected="roomSelected" />
                <ChatBox  v-else :user="user" :messages="messages" :roomSelected="roomSelected"/>
                
            </div>
    
            <input v-if="modeRight == 'room' && roomSelected.id != -1" input maxlength="100"  @keyup.enter="sendmsg" class="message_entry" type="text" v-model="new_message"   placeholder="new message">
            <button v-if="modeRight == 'room' && roomSelected.id != -1" @click="sendmsg">send</button>

        </div>
    </div>
</template>

<script lang="ts">

import { defineComponent, PropType } from 'vue'
import ChatBox from '../components/chat/ChatBox.vue'
import ChatsListing from '../components/chat/ChatsListing.vue'
import CreateChat from '../components/chat/CreateChat.vue'
import ChatAdmin from '../components/chat/ChatAdmin/ChatAdmin.vue'

// import ClientToServerEventsI from '../types/ClientToServerEvents.interface'
// import ServerToClientEventsI from '../types/ServerToClientEvents.interface'
import User from '../types/User'
import { io } from 'socket.io-client';
import RoomI from '../types/interfaces/Room.interface'
import MessageI from '../types/interfaces/Message.interface'
import { LOGGED } from '../types/enums/login.enum'
import GameI from '../types/interfaces/GameI.interface'


export default defineComponent({
    components: {ChatsListing, CreateChat, ChatBox, ChatAdmin },
    props: {
        user: {
            type: User as PropType<User>,
            required: true
        },
        logged: {
            type: String,
            validator: (val: LOGGED) => [LOGGED.LOGGED, LOGGED.PENDING, LOGGED.NOTLOGGED].includes(val),
            required: true
        }
    },
    data() { 
        return {
            chatid: '', 
            socket: io(),
            socket_game: io(),
            rooms: [] as RoomI[],
            messages: [] as MessageI[],
            roomSelected: { id: -1, title: 'Please choose a chat', description: 'none', users: [], bans : [], status : 'public', admins: [], owner: '' } as RoomI,
            roomAsked: { id: -1, title: 'Please choose a chat', description: 'none', users: [], bans : [], status : 'public', admins: [], owner: '' } as RoomI,
            modeLeft: 'room_listing',
            modeRight: 'room',
            new_message: '',
            games: [] as GameI[],

        }
    },
    mounted() {
        this.$emit('need-update')
        this.socket = io('http://localhost:3000/chat', {  withCredentials: true })
       
        this.socket.on("rooms", (args: RoomI[]) => {
            this.rooms = []
            for (let i = 0;  i < args.length; i++){
                this.rooms.push(args[i])
            }
        })
        this.socket.on("messages", (args: MessageI[]) => {
            this.roomSelected = this.roomAsked;
            this.modeRight = 'room'
            let tmp = [] as MessageI[];
            for (let i = 0;  i < args.length; i++){
                if (!this.user.blocked.find(element => element == args[i].user.id))
                    tmp.unshift(args[i])
            }
            this.messages = tmp;
        })
        this.socket.on("messageAdded", (args: MessageI) => {
            if (!this.user.blocked.find((element: string) => element == args.user.id))
                this.messages.push(args)
        })


        this.socket_game = io('http://localhost:3000/game', {  withCredentials: true })

        this.socket_game.on('waiting', (game: GameI) => {
            let username = '';
            for (let i = 0; i < this.roomSelected.users.length; i++) {
                if (game.player2 == parseInt(this.roomSelected.users[i].id))
                    username = this.roomSelected.users[i].username;
            }
            this.socket.emit('addMessage', {
                content: username + ' you have been challenged by ' + this.user.username,
                room: { id: this.roomSelected.id },
                user: this.user,
                challenger: game.player2,
                game: game.id
            });
            this.$router.push('/game/' + game.id)
            

        })

        this.socket_game.on("games", (args: GameI[]) => {
            this.games = []
            for (let i = 0;  i < args.length; i++) {
                this.games.push(args[i])
            }
        })
    
  },
  
  methods: {
        createChat(infos: RoomI) {
            this.socket.emit('createRoom', infos);
            this.changeModeLeft('room_listing')
        },
        joinRoom(room: RoomI) {
            if (this.roomSelected.id != -1)
                this.socket.emit('leaveRoom')
            this.socket.emit('joinRoom', room);
            this.roomAsked = room;

        },
        changeModeRight(mode: string) {
            this.modeRight = mode 
        },
        changeModeLeft(mode: string) {
            this.modeLeft = mode 
        },
        isAdmin(userid: string) : boolean {
            if (this.roomSelected.id == -1) return false
            for (let i = 0; i < this.roomSelected.admins.length; i++) {
                if (this.roomSelected.admins[i].toString() == userid)
                    return true
            }
            return false;
        },
        isOwner(userid: string) : boolean {
            if (this.roomSelected.id == -1) return false
            return (this.roomSelected.owner == userid ? true : false)
        },
        unjoinRoom() {
            if (this.roomSelected.id == -1) return;
            this.socket.emit('leaveRoom')
            this.socket.emit('unjoinRoom', this.roomSelected);
            this.changeModeRight('room')
            this.roomSelected.id = -1
        },
        sendmsg() {
            if (this.new_message == '') return ;
            if (this.new_message.substring(0, 6) == '/match' ) {
                if (this.createGame(this.new_message.substring(6).trim()) == 'valid')
                    return ;
            }
             this.socket.emit('addMessage', {
                content: this.new_message,
                room: { id: this.roomSelected.id },
                user: this.user,
                challenger: -1,
                game: -1
            });
            this.new_message = ''
        },
        createGame(username: string) {
            let id = '';
                if (this.isInGame(this.user.id)) return 'notValid';
            for (let i = 0; i < this.roomSelected.users.length; i ++) {
                if (username == this.roomSelected.users[i].username)
                    id = this.roomSelected.users[i].id;
            }
            if (id == this.user.id || id == '' )
                return 'notValid'
            else {
                if (this.isInGame(id)) return 'notValid';

                let setup = {} as GameI;
                setup.acceleration = 1;
                setup.player1 = parseInt(this.user.id);
                setup.player2 = parseInt(id);
                setup.theme = 'normal'
                this.socket_game.emit('onCreateGame', setup);

                return 'valid'
            }
        },
        isInGame(userId: string) {
            for (let i = 0; i < this.games.length; i++) {
                if (this.games[i].player1 == parseInt(userId) || this.games[i].player2 == parseInt(userId))
                    return true;
            }
            return false;
        }
  }
})
</script>

<style scoped>
    #chat_global {
        display: flex;
        width: 100%;
        justify-content: space-between;
        height: 100%;
    }

    #left_side {
        align-items: center;
        align-content: center;
        justify-content: center;
        display: flex;
        flex-direction: column;
        min-width: 35%;
        padding: 0px;
    }

    #right_side {
        align-items: center;
        align-content: center;
        justify-content: flex-start;
        display: flex;
        flex-direction: column;
        min-width: 65%;
        max-width: 65%;
        padding: 0px;
    }

    .switching {
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: 100%;
        min-width: 100%;
        margin: 10px 0px 10px 0px;
    }

    .left_side_bottom {
        width: 100%;

    }


    .right_side_bottom {
        min-width: 100%;
        min-height: 400px;
        max-width: 100%;
        max-height: 400px;

        margin: 15px;
    }

     .message_entry {
        width: 95%;
        border-radius: 10px;
        border: 1px black solid;
    }



     input[type=text]:focus{
        border: 3px solid #00503c;  
        outline: 0px;   /* oranges! yey */
    }
    
</style>