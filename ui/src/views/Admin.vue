<template> 
    <div >
       <h4>Admin options</h4>
        <div v-if="rooms.length > 0">
                <span class="description" >You can delete a room</span>
                <br/>
                What room should I delete ?
                <select v-model="roomToDel">
                <option v-for="room in rooms" :value="room"  :key="room.id">{{ room.title }} #{{ room.id}}</option>
                </select>
            <button v-if="roomToDel.id != -1" @click="deleteRoom">Delete room</button>
        </div>
        <br>
        <br>
        <br>
        <div>
             <span class="description" >You can ban a user, even yourself, fun no ?</span>
                <br/>
                What user should I ban, be carefule you can't go back ?
            <select v-model="userToBan">
            <option v-for="user in usersToBan" :value="user"  :key="user.id">{{ user.username }}</option>
            </select>
            <button @click="banUser">Ban user</button>
            {{ succes }} {{ error }}
        </div>
        <br> 
    </div>
</template>

<script lang="ts">

import { defineComponent , PropType} from 'vue'
import RoomI from '../types/interfaces/Room.interface'
import User from '../types/User'
import { io } from 'socket.io-client';
import axios from 'axios';
 

export default defineComponent({
    props: {
        user : {
            required: true,
            type: User as PropType<User>,
        },
    },
    data() {
        return {
            socket: io(),
            usersToBan: [] as User[],
            userToBan: {id: '-1' } as User,
            UserToUnBan: {id: '-1' } as User,
            roomToDel: { id: -1} as RoomI,
            rooms: [] as RoomI[],
            succes: '',
            error: '',

        }

    },
    emits: [ 'update-params', 'change-room'],
    mounted() {
        this.updateUsers()
        this.socket = io('http://localhost:3000/chat', {  withCredentials: true })

        this.socket.on("rooms", (args: RoomI[]) => {
            this.rooms = []
            for (let i = 0;  i < args.length; i++){
                this.rooms.push(args[i])
            }
        })
    },
    methods: {
        deleteRoom() {
            if (this.roomToDel.id == -1) return ;
            this.socket.emit('deleteRoom', this.roomToDel.id);
            this.roomToDel.id = -1;
        },
        banUser() {
            axios.post('/api/users/profile/admin/ban/' + this.userToBan.id.toString(), { withCredentials: true })
                .then(response => {
                    this.succes ='success'
                    this.error = ''
                })
                .catch(error => {
                   this.error = 'error occured'
                   this.succes = ''
                })
        },
        updateUsers() {
            axios
                .get('/api/users', { withCredentials: true })
                .then(response => {
                    this.usersToBan = response.data;
                })
                .catch(error => {
                    this.error = 'Error! Could not reach the API. ' + error
                    this.succes= ''
                })
        },
    }

})

</script>

<style scoped>

    input {
        max-width: 100px;
    }
    
    .chat_admin {
        color: black;
    }

    h4 {
        margin: 0 0 30px 0 ;
    }

    .description {
        font-size: 15px;
        font-style: italic;
    }

    select {
    cursor: pointer; 

    }

</style>


