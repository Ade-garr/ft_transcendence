
<template>
    <div class="Leaderboard">
		<h1>Leaderboard</h1>
		<div class="leaderboard" v-for="user in partialUsers" :key="user.id">
			<router-link class="userCard" :to="{ name: 'profile_others', params: { userid: user.id }}">
				<img id="avatar" :src="user.avatar">
				<div id="username">{{ user.username }}</div>
				<div>victories: {{ user.victories }}</div>
				
				<div class="achievements" v-for="(pic, index) in achievements(user.achievements)" :key="index">
					<img id="achievement" :src="pic">
				</div>
			</router-link>
		</div>
    </div>
</template>

<script lang="ts">
import axios from "axios"
import { defineComponent } from "vue"
import PartialUserI from "../types/interfaces/PartialUserI.interface"
export default defineComponent({
	components: {},
	data() {
		return {
			partialUsers: [] as PartialUserI[],
			errorMessage: '',
			listAchievement: [
			"http://localhost:3000/cup.png",
			"http://localhost:3000/alien.png",
			"http://localhost:3000/goat.png",
			"http://localhost:3000/goldmedal.png",
			"http://localhost:3000/loser.png",
			"http://localhost:3000/ok.png",
			"http://localhost:3000/five.png",
			"http://localhost:3000/unbeatable.png",
			"http://localhost:3000/famous.png",
			"http://localhost:3000/snail.png",
		],
		}
	},
	methods: {
		getLeaderboard() {
			axios
			.get('/api/users/leaderboard', { withCredentials: true})
			.then( response => { 
				this.partialUsers = response.data
			})
			.catch( error => {
				this.errorMessage = 'Error! Could not reach the API. ' + error
			})
		},
		achievements(userAch: boolean[]) {
			let userPics : string[] = [];
			for (let i = 0; i < userAch.length; i++ ) {
				if (userAch[i] == true) {
					userPics.push(this.listAchievement[i]);
				}
			}
			return userPics;
		}

	},
	mounted() {
		this.getLeaderboard();
	},
})
</script>

<style scoped> 
	.leaderboard {
		align-content: space-between;
		padding: 10px;
	}

	.achievements {
		padding-left: 120px;
		justify-content: space-around;
		padding-right: 60px;

	}
	#achievement {
		width: 30px;
		height: 30px;
	}

	.userCard {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		flex-wrap: wrap;
		align-items: center;
		border: 1px solid #e1e1e1;
		border-radius: 25px;
		background-color: #e1e1e1;
		text-decoration: none;
	}

	#avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
	}

	#username {
		padding-right: 60px;
		padding-left: 140px;
		font-weight: bold;
	}
</style>