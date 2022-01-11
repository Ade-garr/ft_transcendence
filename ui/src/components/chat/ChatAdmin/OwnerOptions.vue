<template>
        <div class="params">
            <h4>Owner options</h4>
            <form style="display:inline;">
                <div v-if="roomSelected.status != 'private'">
                    <span class="description">Change password</span>
                    <input type="password" v-model="new_mdp" placeholder="" />
                    <br/>
                    <span class="description">Verification</span>
                    <input type="password" v-model="new_mdp_confirmation" placeholder="be careful" />
                    <br/>
                    <button type="button" class="red_button" @click="changePassword">Update password</button>
                    <br>
                </div>
                <select v-if="usersToAdmin.length" v-model="new_admin">
                <option value="">none</option>
                <option v-for="userToAdmin in usersToAdmin" :value="userToAdmin.id" :key="userToAdmin.id">{{ userToAdmin.username }} </option>
                </select>
                <button v-if="usersToAdmin.length" type="button" @click="onUpdateAdmin(new_admin)">Add admin</button>

                <select v-if="adminWithoutOwner.length" v-model="old_admin">
                <option value="">none</option>
                <option v-for="admin in adminWithoutOwner" :value="admin" :key="admin.id">{{ admin.username }} </option>
                </select>
                <button v-if="adminWithoutOwner.length" type="button" @click="onUpdateAdmin(old_admin.id.toString())">Rmv admin</button>
                <br>
            <button  type="button" class="red_button" @click="deleteRoom">Delete room</button>
        </form>

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
                    return true
            }
            return false;
        },
        isOwner(userid: string) : boolean {
            return (this.roomSelected.owner == userid ? true : false)
        },
        isBans(userid: string) : boolean {
            for (let i = 0; i < this.roomSelected.bans.length; i++) {
                if (this.roomSelected.bans[i].toString() == userid)
                    return true
            }
            return false;
        },
        isUser(userid: string) : boolean {
            for (let i = 0; i < this.roomSelected.users.length; i++) {
                if (this.roomSelected.users[i].toString() == userid)
                    return true
            }
            return false;
        },
        changePassword() { //
            if (this.new_mdp != this.new_mdp_confirmation) return ;
            let newRoom = this.roomSelected;
            newRoom.password = this.new_mdp;
            this.socket.emit('changePassword', newRoom );
            this.new_mdp = '';
            this.new_mdp_confirmation = '';
        },
        deleteRoom() {
            this.socket.emit('deleteRoom', this.roomSelected.id);
            this.$emit('change-room', {
                id: -1,
            });
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
            this.socket.emit('updateAdmin', { userId: parseInt(userId), roomId: this.roomSelected.id });
            this.$emit('change-room', { room: {
                id: this.roomSelected.id,
                }
            });
        },
    },
    data() {
        return {
            new_mdp: '',
            new_mdp_confirmation: '',
            new_admin: '',
            old_admin: '',
            socket: io(),
            users: [] as User[],
            error: ''
        }
    },
    emits: [ 'update-params', 'change-room'],
    mounted() {
      
        this.socket = io('http://localhost:3000/chat', {  withCredentials: true })
        this.updateUsers()
    },
    computed: {
        usersToAdmin() : User[] {
            return  this.roomSelected.users.filter((element: User) => { return (!this.isBans(element.id) && !this.isAdmin(element.id)) }); 
        },
        adminWithoutOwner() : User[] {
            return  this.roomSelected.users.filter((element: User) => { return (this.isAdmin(element.id) && !this.isOwner(element.id)) }); 
        }
  }
})

</script>

<style scoped>

    input {
        max-width: 100px;
    }

    h4 {
        margin: 0;
    }

    .chat_admin {
        color: black;
    }

    .params {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        margin: 10px;
        border-bottom: solid 1px #cfccca;
        padding-bottom: 5px;
        width: 100%;
    }

    input[type=password] {
        width: 180px;
        border-radius: 4px;
        border: 2px #00503c solid;
    }

    input[type=password]:focus{
        border: 3px solid #00503c;  
        outline: 0px;   /* oranges! yey */
    }

    button {
        cursor: pointer;
        margin: 5px;
    }

    .red_button {
        background-color: #c85a19;
        border: 0;
        color: white;
        border-radius: 5px;
        padding: 3px;
    }

    .description {
        font-size: 15px;
    }


</style>


