<template>
    <div>
        <div id="gaming_board">
            <img v-if="theme == 'tennis'" class="banniere" src="http://localhost:3000/rolox-pub-banniere.jpeg">
            <canvas id="board"></canvas>
            <img v-if="theme == 'tennis'" class="banniere" src="http://localhost:3000/rolox-pub-banniere-right.jpeg">
            <br>
        </div>

    </div>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import User from '../types/User'
import axios from 'axios'
import { io } from 'socket.io-client'
import { LOGGED } from '../types/enums/login.enum'
import GameI from '../types/interfaces/GameI.interface'
import PadI from '../types/interfaces/PadI.interface'
import PointI from '../types/interfaces/PointI.interface'

let     lastW = 0;
let     lastS = 0;
const   fps = 34;

export enum GameStatus {
	INCOMPLETE="incomplete",
	INPROGRESS="in progress",
	PLAYER1WON="player 1 won",
	PLAYER2WON="player 2 won",
}


function multiply_by_x(x: number, y: number, mult: number) {
  return ({x: x * mult, y: y * mult})
}

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
            gameId: -1,
            socket: io(),
            theme: 'normal',
            acceleration: 1,
            users: [] as User[],
            opponent: { id: '-1'} as User,
            game: {} as GameI,
            status: GameStatus.INCOMPLETE,
            cvs: {} as HTMLCanvasElement,
            ctx: {} as CanvasRenderingContext2D | null,
            moveInterval: -1,

            direction: {x: 0, y: 0} as PointI,
            pad1: {} as PadI,
            pad2: {} as PadI,
            ball: {} as PointI,
            score1: 0,
            score2: 0,

            message: '',
            test: 1,

            BackToFrontXRatio: 1,
            BackToFrontYRatio: 1,
            actualHeight: 480,
            actualWidth: 650,
            actualBallRadius: 7,

            InnerWToW: 0.6 as const,
            WtoHRatio: 0.73846153 as const,
            stdHeight: 480 as const,
            stdWidth: 650 as const,
            stdPadH: 68 as const,
            stdPadW: 20 as const,
            stdBallRadius: 7 as const,
        }
    },
    computed: {
        HPercent() { return this.InnerWToW * this.WtoHRatio },
        PadYplusPadH() { return this.pad2.y + this.pad2.height }
    },
    beforeMount() {
        this.direction.x = 0;
        this.direction.y = 0;
        this.gameId = this.getGameId();
        this.socket = io('http://localhost:3000/game', {  withCredentials: true })

        this.socket.emit('onJoinGame', this.gameId);

        this.socket.on('disconnect', () => {
            this.message = "disconnect";
        })

        this.socket.on('gameInfos', (game: GameI) => {
            this.theme = game.theme;
            this.status = game.status;
            this.updateDimensions();
            if (this.theme == "tennis") {
                const board = document.getElementById("gaming_board") ;
                if (board)
                    board.style.backgroundColor = "#c85a19"
            }
            this.pad1.y = game.pad1 * this.BackToFrontYRatio;
            this.pad2.y = game.pad2 * this.BackToFrontYRatio;
            this.ball.y = game.ball.y * this.BackToFrontYRatio;
            this.ball.x = game.ball.x * this.BackToFrontXRatio;
            this.actualBallRadius = this.stdBallRadius * this.BackToFrontXRatio;

            this.draw();
             if (this.moveInterval == -1)
                this.moveInterval = setInterval(this.move, fps);
        })

        this.socket.on('startGame', (game: GameI) => {

            this.theme = game.theme;
            if (this.theme == 'tennis') {
                const board = document.getElementById("gaming_board") ;
                if (board)
                    board.style.backgroundColor = "#c85a19"
            }
            this.pad1.y = game.pad1 * this.BackToFrontYRatio;
            this.pad2.y = game.pad2 * this.BackToFrontYRatio;
            this.ball.y = game.ball.y * this.BackToFrontYRatio;
            this.ball.x = game.ball.x * this.BackToFrontXRatio;
            this.actualBallRadius = this.stdBallRadius * this.BackToFrontXRatio;

            this.direction.x = game.direction.x * this.BackToFrontXRatio;
            this.direction.y = game.direction.y * this.BackToFrontYRatio;
            this.status = game.status;
            this.acceleration = game.acceleration;

            this.draw();
            if (this.moveInterval == -1)
                this.moveInterval = setInterval(this.move, fps);
        })

        this.socket.on('endGame', (update: { gameId: number, status: GameStatus}) => {
            this.status = update.status;

            this.direction.x = 0;
            this.direction.y = 0;

            if (this.moveInterval != -1)
                clearInterval(this.moveInterval)
            this.moveInterval = -1;
            if (!this.ctx || !this.cvs) return ;
            this.ctx.fillText(update.status, this.cvs.width * 0.5 - 100, this.cvs.height  * 0.2);
        })

        this.socket.on('updateScore', (game: { gameId: number, score1: number, score2: number, ball: PointI, direction: PointI }) =>{
            if (this.status != GameStatus.INPROGRESS) return ;

            this.ball.y = game.ball.y * this.BackToFrontYRatio;
            this.ball.x = game.ball.x * this.BackToFrontXRatio;
            this.actualBallRadius = this.stdBallRadius * this.BackToFrontXRatio;
            this.score1 = game.score1;
            this.score2 = game.score2;

            this.direction.x = game.direction.x * this.BackToFrontXRatio;
            this.direction.y = game.direction.y * this.BackToFrontYRatio;
            
            this.draw();
            if (this.moveInterval == -1)
                this.moveInterval = setInterval(this.move, fps);
        })

        this.socket.on('updateGame', (game : GameI) => {
            if (this.moveInterval == -1)
                this.moveInterval = setInterval(this.move, fps);

            this.theme = game.theme
            if (this.theme == 'tennis') {
                const board = document.getElementById("gaming_board") ;
                if (board)
                    board.style.backgroundColor = "#c85a19"
            }

             this.updateDimensions();
            this.pad1.y = game.pad1 * this.BackToFrontYRatio;
            this.pad2.y = game.pad2 * this.BackToFrontYRatio;
            this.ball.y = game.ball.y * this.BackToFrontYRatio;
            this.ball.x = game.ball.x * this.BackToFrontXRatio;
            this.actualBallRadius = this.stdBallRadius * this.BackToFrontXRatio;
            this.status = game.status;
            this.score1 = game.score1;
            this.score2 = game.score2;

            this.acceleration = game.acceleration;
            this.direction.x = game.direction.x * this.BackToFrontXRatio;
            this.direction.y = game.direction.y * this.BackToFrontYRatio;

            
            this.draw();
            if (this.moveInterval == -1)
                this.moveInterval = setInterval(this.move, fps);
        })

        this.socket.on('updatedPad', (args : any) => {
            if (this.moveInterval == -1)
                this.moveInterval = setInterval(this.move, fps);
            
            if (args.player == 1) {
                this.erasePad(this.pad1)
                this.pad1.y = args.pad * this.BackToFrontYRatio;
                this.drawPad(this.pad1);
                this.drawPad(this.pad2);
            } else {
                this.erasePad(this.pad2)
                this.pad2.y = args.pad * this.BackToFrontYRatio;
                this.drawPad(this.pad1);
                this.drawPad(this.pad2);
            }
        })

        this.socket.on('updateBall', (game : GameI) => {
            
            if (this.status != GameStatus.INPROGRESS) return ;

            this.ball.y = game.ball.y * this.BackToFrontYRatio;
            this.ball.x = game.ball.x * this.BackToFrontXRatio;
            this.direction.x = game.direction.x * this.BackToFrontXRatio;
            this.direction.y = game.direction.y * this.BackToFrontYRatio;

            this.draw();
            if (this.moveInterval == -1)
                this.moveInterval = setInterval(this.move, fps);
        })

        window.addEventListener('keydown', (event) => {
            this.gameId = this.getGameId();
            if (event.key === 'ArrowUp') {
                if (Date.now() - lastW < 75) return ;
                lastW = Date.now()
                this.socket.emit('onMovePad', { gameId: this.gameId, move: -40});
            }
            if (event.key === 'ArrowDown') {
                 if (Date.now() - lastS < 75) return ;
                lastS = Date.now()
                this.socket.emit('onMovePad', { gameId: this.gameId, move: 40});

            }
        })
        window.addEventListener('resize', this.updateDimensions);
        this.socket.emit('onJoinGame', this.gameId);

    },
    mounted() {
        this.updateUsers();
        this.setUpCanvas();
        this.updateDimensions();
        this.update();
    },
    beforeUnmount() {
        if (this.status == GameStatus.INPROGRESS || this.status == GameStatus.INCOMPLETE)
            this.socket.emit("leaveGame", this.gameId);
        if (this.moveInterval != -1)
            clearInterval(this.moveInterval);
        this.moveInterval == -1;
        this.direction.x = 0;
        this.direction.y = 0;
    },
    methods: {
        updateUsers() {
            axios
                .get('/api/users', { withCredentials: true })
                .then(response => {
                    this.users = response.data.filter((element: User) => { return (element.id != this.userid) });
                })
        },
        update() {
            this.socket.emit('onGameInfos', parseInt(this.$route.params.gameid[0]));
        },
        draw() {
            if(!this.ctx || !this.cvs) return ;

            this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height)

            this.ctx.beginPath();
            if (this.theme == 'tennis')
                this.drawTennis();

            if (this.status == GameStatus.INCOMPLETE) {
                this.ctx.font = "30px Arial";
                this.ctx.fillStyle = 'white'
                this.ctx.fillText("Waiting for challenger", this.cvs.width * 0.3 - 147, this.cvs.height  * 0.2); 
            }
            this.drawPad(this.pad1);
            this.drawPad(this.pad2);

            this.drawBall();
            if (this.status == GameStatus.INPROGRESS)
                this.drawScore();
            if (this.status == GameStatus.PLAYER1WON || this.status == GameStatus.PLAYER2WON) 
                this.ctx.fillText(this.status, this.cvs.width * 0.3 - 147, this.cvs.height  * 0.2);
        },
        drawScore() {
            if(!this.ctx || !this.cvs) return ;
            this.ctx.font = "30px Arial";
            this.ctx.fillStyle = 'white'
            this.ctx.fillText(this.score1.toString(), this.cvs.width * 0.4, this.cvs.height  * 0.3);
            this.ctx.fillText(this.score2.toString(), this.cvs.width * 0.6, this.cvs.height  * 0.3);

        },
        drawTennis() {
            if(!this.ctx || !this.cvs) return ;
            this.ctx.strokeStyle = "grey"
            this.ctx.strokeRect(this.cvs.width / 2, 0, this.cvs.width / 4, this.cvs.height )
            this.ctx.strokeStyle = "white"
            this.ctx.strokeRect(this.cvs.width / 4, 0,this.cvs.width / 2, this.cvs.height)        
            this.ctx.strokeRect(this.cvs.width / 4, this.cvs.height / 8, this.cvs.width / 2, this.cvs.height - this.cvs.height/ 4)
            this.ctx.strokeRect(this.cvs.width / 4, this.cvs.height / 2, this.cvs.width / 2, this.cvs.height - this.cvs.height/ 4)
         
            const bannieres = document.getElementsByClassName("banniere") ;
            const banniereL = bannieres[0] as HTMLElement
            const banniereR = bannieres[1] as HTMLElement

            if (banniereL)
                banniereL.setAttribute("height", this.cvs.height.toString());
            if (banniereR)
            banniereR.setAttribute("height", this.cvs.height.toString());
        },
        drawPad(pad: PadI) {
            if(!this.ctx || !this.cvs) return ;
           this.erasePad(pad);
            this.ctx.fillStyle = 'white'
            this.ctx.fillRect(pad.x, pad.y, pad.width, pad.height);
        },
        erasePad(pad: PadI) {
            if(!this.ctx || !this.cvs) return ;
            this.ctx.clearRect(pad.x - 1, pad.y - 1, pad.width + 2, pad.height + 2)

        },
        drawBall() {
            if(!this.ctx || !this.cvs) return ;
            this.eraseBall();
            // this.ctx.fillRect(pad.x, pad.y, pad.width, pad.height);

            this.ctx.arc(this.ball.x, this.ball.y, this.actualBallRadius, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = 'white';
            this.ctx.fill();
        },
        eraseBall() {
            if(!this.ctx || !this.cvs) return ;
            this.ctx.clearRect(this.ball.x, this.ball.y, this.actualBallRadius, this.actualBallRadius);
        },

        updateDimensions() {
            let previousW = this.cvs.width;
            let previousH = this.cvs.height;

            this.actualWidth = innerWidth * this.InnerWToW;
            this.actualHeight = this.actualWidth * this.WtoHRatio;
            this.checkHValidity()

            const ratioW = this.actualWidth / previousW;
            const ratioH = this.actualHeight / previousH ;
            
            this.BackToFrontXRatio = this.actualWidth / this.stdWidth;
            this.BackToFrontYRatio = this.actualHeight / this.stdHeight;

            this.erasePad(this.pad1);
            this.erasePad(this.pad2);
            this.updatePad1(ratioH);
            this.updatePad2(ratioH);
            this.updateBall(ratioW, ratioH);

            if (!this.cvs) return ; 
            this.cvs.width = this.actualWidth;
            this.cvs.height = this.actualHeight;

            this.draw()
        },
        checkHValidity() {
            if  (this.actualHeight > 0.7 * innerHeight) {
                this.actualHeight = 0.65 * innerHeight;
                this.actualWidth = this.actualHeight / this.WtoHRatio;
            }
        },
        setUpCanvas() {
            this.cvs = document.getElementById('board') as HTMLCanvasElement;
            if (!this.cvs) { return; }
            this.ctx = this.cvs.getContext('2d');
            this.cvs.width = innerWidth * this.InnerWToW;
            this.cvs.height = innerWidth * this.HPercent;
            this.checkHValidity();
            this.pad1.x = 0;

            this.draw();
        },
        updatePad1(ratioH: number) {
            if (this.status != GameStatus.INPROGRESS) { // to change
                this.pad1.width = this.stdPadW * this.BackToFrontXRatio;
                this.pad1.height = this.stdPadH * this.BackToFrontYRatio;
                this.pad1.y = this.actualHeight / 2 - this.pad1.height / 2;
            } else {
                this.pad1.y += this.pad1.height / 2;
                this.pad1.width = this.stdPadW * this.BackToFrontXRatio;
                this.pad1.height = this.stdPadH * this.BackToFrontYRatio;
                this.pad1.y = (this.pad1.y * ratioH) - this.pad1.height / 2;
            }
        },
        updatePad2(ratioH: number) {
            if (this.status != GameStatus.INPROGRESS) { // to change
                this.pad2.width = this.stdPadW * this.BackToFrontXRatio;
                this.pad2.height = this.stdPadH * this.BackToFrontYRatio;
                this.pad2.y = this.actualHeight / 2 - this.pad2.height / 2;
                this.pad2.x = this.actualWidth - this.pad2.width;
            } else {
                this.pad2.y += this.pad2.height / 2;
                this.pad2.width = this.stdPadW * this.BackToFrontXRatio;
                this.pad2.height = this.stdPadH * this.BackToFrontYRatio;
                this.pad2.y = (this.pad2.y * ratioH) - this.pad2.height / 2;
                this.pad2.x = this.actualWidth - this.pad2.width + 1;
            }
        },
        updateBall(ratioW: number, ratioH: number,) {
            if (this.status != GameStatus.INPROGRESS) { // to change
                this.actualBallRadius = this.stdBallRadius * this.BackToFrontXRatio;
                this.ball.y = this.actualHeight / 2;
                this.ball.x = this.actualWidth / 2;
            } else {
                this.actualBallRadius = this.stdBallRadius * this.BackToFrontXRatio;
                this.ball.y = (this.ball.y * ratioH) - this.actualBallRadius;
                this.ball.x = this.ball.x * ratioW - this.actualBallRadius;
                this.direction.x = this.direction.x * ratioW;
                this.direction.y = this.direction.y * ratioH;
            }
        },
        move() {
            if (this.status == GameStatus.INPROGRESS) {
                this.ball.x += this.direction.x;
                this.ball.y += this.direction.y;
            }
            this.checkCollision();
            this.draw();
            this.test += 1 
        },
        checkCollision() {
                if (this.ball.y - this.actualBallRadius <= 0 || this.ball.y + this.actualBallRadius >= this.cvs.height) {
                    this.direction.y = -this.direction.y;
                    return true;
                }
                else if (this.ballLeft(this.ball.x) <= 0) {
                    this.ball.y = this.cvs.height / 2;
                    this.ball.x = this.cvs.width / 2;
                    this.direction.x = 0;
                    this.direction.y = 0;
                    return true;
                }
                else if (this.ballRight(this.ball.x) >= this.cvs.width) {
                    this.ball.y = this.cvs.height / 2;
                    this.ball.x = this.cvs.width / 2;
                    this.direction.x = 0;
                    this.direction.y = 0;
                    return true;
                }
                else if (this.ballLeft(this.ball.x) <= this.pad1.width) {
                if (this.ballBottom(this.ball.y) < this.pad1.y + this.pad1.height && this.ballTop(this.ball.y) > this.pad1.y) {
                    this.direction.x = -this.direction.x;
                    this.ball.x = this.pad1.width + this.actualBallRadius + 1;
                    this.direction = multiply_by_x(this.direction.x, this.direction.y, this.acceleration);
                    return true;
                }
                }
                else if (this.ballRight(this.ball.x) >= this.pad2.x) {
                        if (this.ballBottom(this.ball.y) < this.pad2.y + this.pad2.height && this.ballTop(this.ball.y) > this.pad2.y) {
                        this.direction.x = -this.direction.x;
                        this.ball.x = this.pad2.x - this.actualBallRadius - 1;
                        this.direction = multiply_by_x(this.direction.x, this.direction.y, this.acceleration);
                        return true;
                    }
                }
                return false// game.direction = multiply_by_x(game.direction.x , game.direction.y, game.acceleration);
        },
        getGameId() {
            let temp = this.$route.params.gameid;
            if (!temp) return -1
            let temp2 = ''
            for (let i = 0; i < temp.length; i++ )
                temp2 += temp[i];
            return parseInt(temp2);
        },
        ballLeft(x: number) {
            return (x - this.actualBallRadius);
        },
        ballRight(x: number) {
            return (x + this.actualBallRadius);
        },
        ballTop(y: number) { 
            return (y - this.actualBallRadius);
        },
        ballBottom(y: number) {
            return (y + this.actualBallRadius);
        }
    }
})
</script>

<style scoped>
      
   #board {
        border: solid 2px white;
    }

    #gaming_board {
        background-color: black;
        width: 100vw;
        height: 100vh;
        padding: 5vh;
        /* display: flex; */
        /* flex-direction: */

    }

    .score {
        color: white;
        font-size: 3em;
    }


    img {
        width: 50px;
        display: inline;
    }

</style>