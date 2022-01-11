<template>
   <div id="header">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Francois+One&display=swap" rel="stylesheet"> 
      <router-link class="header_elem" to="/multiplayer"><img id="logo" src="http://localhost:3000/rolandgapong.png"/>
      <div id="title">
        <h4>ROLAND-GAPONG</h4>
        <span>16 May - 5 June 2022</span>
      </div></router-link>

      <div id="nav">

        <router-link class="header_elem" to="/chat">Chat</router-link>
        <router-link class="header_elem" to="/multiplayer">Multiplayer</router-link>
        <router-link class="header_elem" :to="{ name: 'Leaderboard'}">Leaderboard<slot/></router-link>
        <router-link class="header_elem" to="/rules">Rules</router-link>
        <router-link class="header_elem" :to="{ name: 'profile'}">Profile<slot/></router-link>
        <router-link class="header_elem" v-if="user.is_admin" :to="{ name: 'admin'}">Admin<slot/></router-link>

      </div>
    
  </div>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { LOGGED } from '../../types/enums/login.enum'




export default defineComponent({
    props: {
        user: {
        required: true
        },
        logged: {
            type: String,
            validator: (val: LOGGED) => [LOGGED.LOGGED, LOGGED.PENDING, LOGGED.NOTLOGGED].includes(val),
            required: true
        }
    },
})
</script>

<style scoped>

  #nav {
    padding: 30px;
  }

  #nav a {
    font-weight: bold;
    color:#3c3b3b;
  }

  #nav a.router-link-exact-active {
    color: #c85a19;
    border-bottom: 0;
  }

   #nav a.router-link-exact-active:hover {
    color: #c85a19;
    border-bottom: 0;
  }

  #nav a:hover {
    border-bottom: 3px solid;
    border-color: #c85a19;
    color:#c85a19;
  }
  
  .reload {
    font-family: Lucida Sans Unicode;
    cursor: pointer;
  }

  #logo {
    height: 55px;
    width: 55px;
  }

  #header {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-bottom: 1px solid #cfccca;
    width: 70vw;
    justify-content: center;

  }

  .header_elem {
    margin: 20px;
    text-decoration: none;
    padding-bottom: 30px;
    font-family: 'Francois One', sans-serif;
  }

  #title {
    margin: 10px;
  }

  #title h4 {
    color: #c94714;
    font-weight: bold;
    font-size: 15px;
    margin: 20px;
    margin: 0;

  }

   #title span {
    color: #c85a19;
    font-size: 13px;
    font-family: Verdana, sans-serif;
    margin: 20px;
    margin: 0;
  }

</style>