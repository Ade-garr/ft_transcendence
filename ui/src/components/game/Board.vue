<template>
    
    <div class="gaming_board">
        {{ game }}
        <!-- {{ game.pad1 }} {{ game.pad2 }} -->
        <!-- {{ game.ball }}
        {{ game.ball.direction }} -->
        <!-- <div><button v-if="ongoing === false" @click="startGame()">Start Game</button></div> -->
        <!-- <span class="score">{{ board.point1 }}</span> -->
        <!-- <canvas id="board"></canvas> -->
        <!-- <span class="score">{{ board.point2 }}</span> -->
    </div>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import GameI from '../../types/interfaces/GameI.interface';
import io from 'socket.io-client' 


export default defineComponent({
    // props: {
    //     dataGame : {
    //         required: true,
    //         type: Object as () => GameI
    //     }
    // },
    data() { 
        return {
            socket: io(),
            game: {} as GameI
        }
    },
    beforeMount() {
        if (this.socket.connected == false)
            this.socket = io('http://localhost:3000/game', {  withCredentials: true })
        
        this.socket.on('updateGame', (game: GameI) => {
            this.game = game;
        })
        
        this.socket.on('game', (game : GameI) => {
            this.game = game;
        })
    },
        // window.addEventListener('keydown', (event) => {
        //     if (event.key === 'w') {
        //         this.socket.emit('onMovePad', { gameId:  this.game.id, move: -1})
        //     }
        //     if (event.key === 's') {
        //         this.socket.emit('onMovePad', { gameId:  this.game.id, move: 1})
        //     }

        
            
        //     // else if (event.key === 'ArrowDown') {
        //     //     this.board.pad1.y += this.board.pad1.height / 5
        //     // }
        // });
})
</script>

<style scoped>
      
   
</style>

