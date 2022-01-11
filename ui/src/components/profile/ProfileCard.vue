<template>
    <div class="card">
        <div>
            <h3>User Profile</h3>
        </div>
        <div id="identity">
            <div id="avatar_profile" >
                <img id="avatar_profile" :src="user.avatar">

            </div>
            <div class="data">
                <div class="line">
                    <span>{{ user.username }}</span><br>
                </div>
                <div v-if="user.is_admin" class="line">
                    <span  class="title">Role: </span><span>Admin</span>
                </div>

            </div>   
        </div>
        
        <div id="stats">
            <div class="data">
                <div class="line">
                    <span class="title">Victories: </span><span>{{ user.victories }}</span><br>
                    <span class="title">Ratio: </span><span>{{ ratio }}</span><br>
                </div>
                <div class="line">
                    <span class="title">Losses: </span><span>{{ user.losses }}</span>
                </div>
            </div>
            <div class="data">
                <div v-for="game in this.user.games" :key="game.id">
                    <span v-if="isWinner(game)" class="green">{{ game.score1 }} - {{ game.score2}}</span>
                    <span v-else class="red">{{ game.score1 }} - {{ game.score2}}</span>
                </div>
                
            </div>

            
        </div>

            
    </div>

</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import User from '../../types/User'
import GameSumUpI from '../../types/interfaces/GameSumUp.interface'


function truncate(num: number) {
    let with2Decimals = num.toString().match(/^-?\d+(?:\.\d{0,2})?/)
    if (!with2Decimals) return ('')
    return with2Decimals[0]
}

export default defineComponent({
    props: {
        user: {
        type: User as PropType<User>,
        required: true
        }
    },
    computed: {
        ratio(): string {
            if (!this.user.losses)
                return (this.user.victories.toString())
            return truncate(this.user.victories/this.user.losses)
        },
        
    },
    methods: {
        isWinner(game: GameSumUpI) {
            if(game.player1 == parseInt(this.user.id) && game.score1 > game.score2)
                return true;
            else if (game.player2 == parseInt(this.user.id) && game.score2 > game.score1) 
                return true;
            return false
        }
    }
    
})
</script>

<style scoped>
    .card {
        background-color: #cecece;
        width: 30%;
        height: 450px;
        padding: 1px;
        border-radius: 10px;
        border: solid 0.5px #4682B4;
        display: flex;
        align-items: center;
        flex-direction: column;
        margin: 10px;
    }

    #identity {
        background-color: #cecece;
        width: 100%;
        height: 200px;
        padding: 0px;
        border-radius: 10px;
        display: flex;
        justify-content: center;
        border: solid 0.1px #4682B4; 
        align-items: flex-start;
        margin: 5px;
    }

    #stats {
        width: 100%;
        height: 150px;
        padding: 0px;
        border-radius: 10px;
        display: flex;
        justify-content: center;
        border: solid 0.1px #4682B4; 
        align-items: flex-start;
        margin: 5px;
    }


    #avatar_profile img {
        width: 200px;
        height: 200px;
        border: none;
    }

    .data {
        width: 100%;
        height: 100px;
        background-color: #e1e1e1;
        border-radius: 10px;
        white-space: nowrap;
        display: flex;
        flex-direction: column;
        margin: 5px;
        align-items: flex-start;
        padding: 5px;
        overflow: auto
    }

    #user_infos h1 {
        white-space: nowrap;
    }

    #user_infos p {
        white-space: nowrap;
    }

    h3 {
        font-size: 15px;
        width: 100%;
        background-color: #e1e1e1;
        border-radius: 25px;
    }

    .green {
        color: green;

    }

    .red {
        color: red;
    }
    
</style>
