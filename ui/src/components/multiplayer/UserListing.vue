<template>
  <div class="user_listing">
    <div v-if="users && users[0]">
        <h3>All players</h3>  
        <li v-for="user in users" :key="user.id">
            <img class="avatar_listing" :src="user.avatar" >
            <router-link class="link" :to="{ name: 'profile_others', params: { userid: user.id }}">{{ user.username }}</router-link>
            <button class="greenbutton" v-if="!isFriend(user.id) && !isBlocked(user.id)"   @click="friend(user.id)">Add friend</button>
            <button class="orangebutton" v-if="!isBlocked(user.id) && !isFriend(user.id) && !user.is_admin" @click="block(user.id)">Block user</button>
            <img v-if="user.is_admin" class="avatar_listing" src="http://localhost:3000/sherif-star.png" >
            

        </li>
    </div>
    <p v-else>{{ usersMsg }}</p>
  </div>
</template>




<script lang="ts">
import { defineComponent } from 'vue'
// import getUsers from '../../composables/getUsers'
import toggleFriend from '../../composables/toggleFriend'
import toggleBlocked from '../../composables/toggleBlocked'
import axios from 'axios';
import User from '../../types/User'


export default defineComponent({
components: {  },
    data() {
        return {
            users: [] as User[],
            friends: [] as number[],
            blocked: [] as number[],
            errorMessage: '',
            usersMsg: ''
        }
    },
    props: {
        userid: {
        type: Number,
        required: true,
        }
    },
    emits: [ 'need-update'],
    methods: {
        updateUsers() {
            axios
                .get('/api/users', { withCredentials: true })
                .then(response => {
                    this.users = response.data.filter((element: User) => { return (parseInt(element.id) != this.userid) });
                    this.errorMessage = ''
                    if (!this.users[0])
                        this.usersMsg= 'THERE ARE NO USERS'
                    else
                        this.usersMsg= ''

                })
                .catch(error => {
                    this.errorMessage = 'Error! Could not reach the API. ' + error
                    this.usersMsg= 'THERE ARE NO USERS'
                })
        },
        friend: function (userid: string) {  
            toggleFriend(userid).then(() => {this.updateFriendsList()})
        },
		gamePath(id: string) : string {
			return ('/games/' + id)
		},
        updateFriendsList() {
            axios
                .get('/api/users/profile/friends', { withCredentials: true })
                .then(response => {
                let tmp = [] as number[]
                this.errorMessage = '' 
                for (const value of response.data)
                    tmp.push(value.id)
                this.friends = tmp;
            })
            .catch(error => {
                this.errorMessage = 'Error! Could not reach the API. ' + error
            })
        },
        updateBlockedList() {
            axios
                .get('/api/users/profile/blocked', { withCredentials: true })
                .then(response => {
                let tmp = [] as number[]
                this.errorMessage = ''
                for (const value of response.data)
                    tmp.push(value.id)
                this.blocked = tmp;
                
            })
            .catch(error => {
            this.errorMessage = 'Error! Could not reach the API. ' + error
            })
        },
        createUser(username: string, avatar: string, id: string) {
            return (new User(username, avatar, id, [], [], false, 8, 3, 'offline', 'boss' ))
        },
        isFriend(id: number) {
            let result = false;
            this.friends.forEach((element: number) => {
                if (element === id) {
                    result = true;
                }
            })
            return result;
        },
        isBlocked(id: number) {
            let result = false;
            this.blocked.forEach((element: number) => {
                if (element === id) {
                    result = true;
                }
            })

            return result;
        },
        block(userid: number) {
            
            toggleBlocked(userid.toString()).then(() => { 
                this.updateBlockedList(); 
                this.$emit('need-update');
            })      
        }
    },
    mounted() {
        this.updateFriendsList()
        this.updateBlockedList()
        this.updateUsers()
    }
})
</script>

<style scoped>

/*   
    @media screen and (max-width: 1350px) {
	} */

/* 
    .users_listing {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin: 10px 10px 20px 10px;
        padding: 20px;
        width: 100%;
        max-width: 600px;
        border-radius: 20px;
        overflow: auto;
        max-height: 500px;
        overflow-y: auto;
        overflow-x: hidden;
        align-items: center;
    } */

    .greenbutton {
        background-color:  #00503c;
        border: 0;
        border-radius: 12px;
        color: #FFFFFF;
        cursor: pointer;
        display: inline-block;
        font-family: -apple-system,system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
        font-size: 10px;
        font-weight: 500;
        line-height: 2.5;
        outline: transparent;
        padding: 0 1rem;
        text-align: center;
        text-decoration: none;
        transition: box-shadow .2s ease-in-out;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        white-space: nowrap;
        max-height: 50%;
    }

    .avatar_listing {
        width: 30px;
        height: 30px;
        border-radius: 20%;
    }

    .orangebutton {
        background-color: #c85a19;
        border: 0;
        border-radius: 12px;
        color: #FFFFFF;
        cursor: pointer;
        display: inline-block;
        font-family: -apple-system,system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
        font-size: 10px;
        font-weight: 500;
        line-height: 2.5;
        outline: transparent;
        padding: 0 1rem;
        text-align: center;
        text-decoration: none;
        transition: box-shadow .2s ease-in-out;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        white-space: nowrap;
        max-height: 50%;
    }

    .online {
        color: green;
        font-size: 10px;
    }

     li {
    list-style-type: none;
    display: flex;
    padding: 5px 5px 5px 5px;
    margin: 5px 5px 5px 5px;
    align-items: center;
    max-height: 20px;
    justify-content: space-between;   
    border: solid 0.5px #4682B4;
    border-radius: 10px;
    width: 95%;
  }


</style>