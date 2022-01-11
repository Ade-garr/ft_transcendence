<template>
    <div class="card">
        <div>
            <h3>Relations</h3>
        </div>
        <div class="listing_div">
            Friends:
            <p v-if="!friends[0]">You don't have any friends</p>
            <div v-for="friend in friends" :key="friend">
                <OneFriend @need-update="update()" :user="createUser(friend.username, friend.avatar, friend.id, friend.status)"/>
            </div>
        <p class="error" v-if="errorFriends != ''">{{ errorFriends }}</p>

        </div>
        <div class="listing_div">
            Blocked:
            <div v-for="block in blocked" :key="block">
                <OneBlocked @need-update="update()" :user="createUser(block.username, block.avatar, block.id)" />
            </div>       
            <p v-if="!blocked[0]">You don't have any blocked user</p>
        </div>
        <p class="error" v-if="errorBlocked != ''">{{ errorBlocked }}</p>

    </div> 
</template>  

<script lang="ts">

import { defineComponent, PropType } from 'vue'
import User from '../../types/User'
import OneFriend from './OneFriend.vue'
import OneBlocked from './OneBlocked.vue'
import toggleFriend from '../../composables/toggleFriend'
import { io } from 'socket.io-client'


import axios from 'axios';

export default defineComponent({
    data() {
        return {
            friends: [] as string[],
            blocked: [] as string[],
            errorFriends: '',
            errorBlocked: '',
            errorUnblock: '',
            errorUnfriend: '',
            socket_online: io(),
            socket_game: io(),

            errorMessage: '',
        }
    },
    // props: {
    //     usersLogged: {
    //         required: true,
    //         type: [] as PropType<number[]>
    //     },
    // },
    components: { OneFriend, OneBlocked },
    mounted() {
        this.update()
        this.socket_online = io('http://localhost:3000/connection', 
                                     {  withCredentials: true })
        
        this.socket_online.on('updateStatus', () => {
            this.updateFriendsList();
        })

        this.socket_game = io('http://localhost:3000/game', 
                                    {  withCredentials: true })

        this.socket_game.on('updateStatus', () => {
            this.updateFriendsList();
        })
    },

    methods: {
        updateFriendsList() {
            axios
                .get('/api/users/profile/friends', { withCredentials: true })
                .then(response => {
                this.friends = response.data;
                this.errorFriends = ''
            })
            .catch(error => {
                this.errorFriends = 'Error! Could not reach the API. ' + error
            })
        },
        updateBlockedList() {
            axios
                .get('/api/users/profile/blocked', { withCredentials: true })
                .then(response => {
                this.blocked = response.data;
                this.errorBlocked = '' 
            })
            .catch(error => {
                this.errorBlocked = 'Error! Could not reach the API. ' + error
            })
        },
        createUser(username: string, avatar: string, id: string, status: string) {
            let user = new User(username, avatar, id, [], [], false, 8, 3, status, 'boss');
            return user
        },
        callToggleFriend: function (userid: string) {  
            toggleFriend(userid)
            .then( () => this.updateFriendsList())
            .catch((err) => {this.errorUnfriend = err});
        },
        update() {
            this.updateFriendsList()
            this.updateBlockedList()
        }
    },

    
})
</script>

<style scoped>

/* @media screen and (min-width: 1350px) { */

    li {
      list-style-type: none;
      display: flex;
      padding: 5px 5px 5px 5px;
      margin: 5px 5px 5px 5px;
      align-items: center;
      max-height: 20px;
      justify-content: space-between;   
      border-width: 0.5px;
      border-radius: 10px;
      width: 95%;
  }

  .listing_div {
    margin-bottom: 10px;
}

/* } */







</style>

