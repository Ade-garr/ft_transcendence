<template>

    <div>
        <form>
            <h2>Create a new game </h2>
                What theme do you want for your game ?
            <br>
            <input type="radio" value="normal" v-model="theme" />
            <label for="normal">Normal</label><br>
            <input type="radio" value="tennis" v-model="theme" />
            <label for="tennis">Tennis</label>
            <br>
            Do you want the speed of the ball to increase through the game?
            <input type="checkbox" v-model="acceleration" value="2" />Yes<br>
            Opponent: 
            <select v-model="opponent">
                <option v-for="challenger in this.users" :value="challenger" :key="challenger.id">{{ challenger.username }} </option>
            </select>
        </form>
            <button v-if="opponent.id != -1" @click="setUpGame">Launch invitation</button>
            <button v-if="opponent.id == -1" @click="setUpGame">Matchmaking</button>
    </div>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import User from '../types/User'
import axios from 'axios'
import { io } from 'socket.io-client'
import { LOGGED } from '../types/enums/login.enum'
import GameI from '../types/interfaces/GameI.interface'

export default defineComponent({
    props: {
        userid: {
            required: true,
            type: String,
        },
            logged: {
            type: String,
            validator: (val: LOGGED) => [LOGGED.LOGGED, LOGGED.PENDING, LOGGED.NOTLOGGED].includes(val),
            required: true
        },
    },
    data() {
        return {
            socket: io(),
            theme: 'normal',
            acceleration: false,
            users: [] as User[],
            opponent: { id: '-1'} as User,
            drawingInterval: 0,
            message: '',
            games: [] as GameI[],
        }
    },
    beforeMount() {
        this.updateUsers();
    },
    mounted() {
      
        this.socket = io('http://localhost:3000/game', {  withCredentials: true })
      

        this.socket.on('waiting', (game: GameI) => {
            this.$router.push('/game/' + game.id)
        })

        this.socket.on("games", (args: GameI[]) => {
            this.games = []
            for (let i = 0;  i < args.length; i++) {
                this.games.push(args[i])
            }
        })
        
    },
    methods: {
        setUpGame() {
            if (this.isInGame(this.userid)) return 

            let setup = {} as GameI;
            setup.acceleration = this.acceleration ? 1.2 : 1;
            setup.player1 = parseInt(this.userid);
            setup.player2 = parseInt(this.opponent.id);
            setup.theme = this.theme;
            this.socket.emit('onCreateGame', setup);
        },
        updateUsers() {
            axios
                .get('/api/users', { withCredentials: true })
                .then(response => {
                    this.users = response.data.filter((element: User) => { return element.id != this.userid});

                    
                })
        },
        isInGame(userId: string) {
            for (let i = 0; i < this.games.length; i++) {
                if (this.games[i].player1 == parseInt(userId) || this.games[i].player2 == parseInt(userId)) {
                    return true;
                }
            }
            return false;
        }
    }
   
})
</script>

<style scoped>
      
   #board {
        border: solid 2px white;
    }

    .gaming_board {
        background: #c85a19;
        width: 100vw;
        height: 100vh;
        padding: 5vh;

    }

    .score {
        color: white;
        font-size: 3em;
    }
</style>
