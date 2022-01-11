<template>
  <div id="games_listing">
        <router-link v-if="!isInGame()" style="text-decoration: none" class="header_elem" :to="{ name: 'SetGame'}">Create a game</router-link>
        <div v-if="games.length > 0">
			<h3>On going games</h3>
            <li style="list-style-type: none;" v-for="game in getDuels(games)" :key="game.id">
                <router-link  style="text-decoration: none" :to="{ name: 'game', params: { gameid: game.id.toString() }}">
                    <p id="match">{{ getUsername(game.player1) }}  vs {{ getUsername(game.player2) }} </p></router-link> {{ game.score1 }} - {{ game.score2 }}
            </li>
        </div>
        <p v-else>NO PARTY AVALAIBLE</p>
    </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import io from 'socket.io-client'
import GameI from '../../types/interfaces/GameI.interface'
import axios from 'axios'
import User from '../../types/User'


export default defineComponent({
    data() { 
        return {
            errorMessage: '',
            socket: io(),
            games: [] as GameI[],
            users: [] as User[],
            usersMsg: '',
        }
    },
    props: {
        userid: {
        type: Number,
        required: true,
        }
    },
    mounted() {
        this.socket = io('http://localhost:3000/game', {  withCredentials: true })
        if (this.socket.connected == false)
            this.errorMessage = 'The gaming server is not available try again later';

        this.socket.on("games", (args: GameI[]) => {
            this.games = []
            for (let i = 0;  i < args.length; i++) {
                this.games.push(args[i])
            }
        })
        this.updateUsers()
    },
    computed: {
    },
    methods: {
        getDuels(games: GameI[]) {
            let duels: GameI[] = [];
            for (let i = 0; i < games.length; i++) {
                if (games[i].player2 != -1) {
                    duels.push(games[i]);
                }
            }
            return duels;
        },
        updateUsers() {
            axios
                .get('/api/users', { withCredentials: true })
                .then(response => {
                    this.users = response.data;
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
        getUsername(id: number) {
            for (let i = 0; i < this.users.length; i++) {
                if (this.users[i].id == id.toString()){
                    return this.users[i].username;
                }
            }
            return '';
        },
        isInGame() {
            for (let i = 0; i < this.games.length; i++) {
                if (this.games[i].player1 == this.userid || this.games[i].player2 == this.userid)
                    return true;
            }
            return false;
        }

    },
})
</script>

<style scoped>

    #match {
        text-decoration: none;
        font-weight: bold;
    }
    .games_listing {
        overflow: scroll;
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin: 10px 10px 10px 10px;
        padding: 20px;
        width: 100%;
        max-width: 600px;
        border-radius: 20px;
        overflow: auto;
        max-height: 500px;
        overflow-y: auto;
        overflow-x: hidden;
        align-items: center;
    }

    .header_elem {
    margin: 20px;
    text-decoration: none;
    padding-bottom: 30px;
    font-family: 'Francois One', sans-serif;
  }
</style>