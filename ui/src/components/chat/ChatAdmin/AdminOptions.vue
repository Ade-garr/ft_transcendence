<template> 
    <div >
        <h4>Admin options</h4>
        <div v-if="usersToBanOrMute.length > 0">
                <span class="description" >You can sanction an user, if he deserves it or for pleasure</span>
                <br/>
                Who should I target master ?
                <select v-model="UserToSanction">
                <option value="">none</option>
                <option v-for="user in usersToBanOrMute" :value="user"  :key="user.id">{{ user.username }}</option>
                </select>
                <br>
                <input type="radio" value="ban" v-model="sanction" />
                <label for="ban">ban him &nbsp; &nbsp;</label>
                <input type="radio" value="mute" v-model="sanction" />
                <label for="mute">mute him &nbsp; &nbsp;</label>
                
                <input type="radio" value="finish" v-model="sanction" />
                <label for="finish">finish him</label> 
                <br/>
            <div v-if="sanction == 'mute'">
                How long ? 
                <input type="radio" value="one" v-model="duration" />
                <label for="ten">1 minutes</label>
                <input type="radio" value="hour" v-model="duration" />
                <label for="hour">1 hour</label>
                <input type="radio" value="day" v-model="duration" />
                <label for="day">1 day</label>
            </div>
            <button @click="sanctionUser">Sanction user</button>
        </div>
        <div v-if="usersToUnBan.length > 0">
            <select  v-model="UserToUnBan">
            <option value="">none</option>
            <option  v-for="user in usersToUnBan" :value="user"  :key="user.id">{{ user.username }}</option>
            </select>
            <button @click="unbanUser">Unban user</button>
        </div>
        <div v-if="roomSelected.status == 'private' && usersToAdd.length > 0">
            <select v-model="userToAdd">
            <option value="">none</option>
            <option v-for="user in usersToAdd" :value="user"  :key="user.id">{{ user.username }}</option>
            </select>
            <button @click="addUser">Add user</button>
        </div>
        <br>
    </div>
</template>

<script lang="ts">

import { defineComponent , PropType} from 'vue'
import RoomI from '../../../types/interfaces/Room.interface'
import User from '../../../types/User'
import { io } from 'socket.io-client';
import axios from 'axios';


export default defineComponent({
    props: {
        user : {
            required: true,
            type: User as PropType<User>,
        },
        roomSelected : {
            required: true,
            type:  Object as () => RoomI
        },
    },
    methods: {
        isAdmin(userid: string) : boolean {
            if (this.isOwner(userid)) return true;
            for (let i = 0; i < this.roomSelected.admins.length; i++) {
                if (this.roomSelected.admins[i].toString() == userid)
                    return true;
            }
            return false;
        },
        isOwner(userid: string) : boolean {
            return (this.roomSelected.owner == userid ? true : false)
        },
        isBans(userid: string) : boolean {
            for (let i = 0; i < this.roomSelected.bans.length; i++) {
                if (this.roomSelected.bans[i].toString() == userid)
                    return true;
            }
            return false;
        },
        isUser(userid: string) : boolean {
            for (let i = 0; i < this.roomSelected.users.length; i++) {
                if (this.roomSelected.users[i].toString() == userid)
                    return true;
            }
            return false;
        },
        sanctionUser() {
            if (this.UserToSanction.id === '-1')
                return ;
            if (this.sanction === 'ban') {
                this.socket.emit('banUser', { userId: this.UserToSanction.id, room: this.roomSelected } );
            }
            if (this.sanction === 'mute') {
                let durationInMinutes = 1;
                if (this.duration == 'hour')
                    durationInMinutes = 60;
                else if (this.duration == 'day')
                    durationInMinutes = 1440;
                this.socket.emit('muteUser', { id: this.UserToSanction.id, room: this.roomSelected, duration: durationInMinutes });
            }
        },
        updateUsers() {
            axios
                .get('/api/users', { withCredentials: true })
                .then(response => {
                    this.users = response.data.filter((element: User) => { return (element.id != this.user.id) });
                    // this.errorMessage = ''
                })
                .catch(error => {
                   this.error = error;
                })
        },
        onUpdateAdmin(userId: string) {
            this.socket.emit('updateAdmin', { userId: parseInt(userId), roomId: this.roomSelected.id } );
        },
        addUser() {
            if (this.userToAdd.id == '-1') return ;
                this.socket.emit('inviteToPrivateRoom', { userId: parseInt(this.userToAdd.id), room: this.roomSelected  } );
        },
        unbanUser() {
            if (this.UserToUnBan.id === '-1') return ;
            this.socket.emit('unbanRoom', { userId: this.UserToUnBan.id, room: this.roomSelected } );
        }
    },
    data() {
        return {
            add_user: '',
            sanction: '',
            socket: io(),
            users: [] as User[],
            UserToSanction: {id: '-1' } as User,
            userToAdd: {id: '-1' } as User,
            UserToUnBan: {id: '-1' } as User,
            time: "09:49",
            date: "2021-12-01",
            duration: 'minutes',
            error: ''
        }
    },
    emits: [ 'update-params', 'change-room'],
    mounted() {
        if (this.socket.connected == false)
            this.socket = io('http://localhost:3000/chat', {  withCredentials: true })
        this.updateUsers()
    },
    computed: {
        usersToBanOrMute() : User[] {
            return this.roomSelected.users.filter((element: User) => { return !this.isAdmin(element.id) }); 
        },
        usersToAdd() : User[] {
            return  this.users.filter((element: User) => { return (!this.isBans(element.id) && !this.isUser(element.id)) }); 
        },
        usersToUnBan() : User[] {
            return this.users.filter((element: User) => { return (this.isBans(element.id))});
        },
        dateNow() : string {
            var today = new Date();
            return today.getFullYear()+'-'+today.getMonth()+'-'+today.getDate();
        }
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

</style>


