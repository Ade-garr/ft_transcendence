<template>
  <div id="app">
      <Header :logged="logged" :user="user"/>
      <router-view class="content" v-if="logged == 'LOG' || isTWOFA()"  @update-logged="updateLogged" @need-update="updateInfos"  :logged="logged" :user="user" :userid="user.id"/>
      <div v-if="logged == 'NLOG' "  class="all_page"><a class="connect" href="http://localhost:3000/api/auth/login">Connect/create account using 42 Connect</a></div>
      <div v-if="errorMessage != ''"></div>
  </div>
</template>
 

<script lang="ts">

import { defineComponent} from 'vue'
import axios from 'axios';
import Header from './components/app/Header.vue'
import User from './types/User';
import { LOGGED } from './types/enums/login.enum'
import { io } from 'socket.io-client'
const options = { withCredentials: true };


function rdmStr(length: number): string {
    let result = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


export default defineComponent({
  name: 'App',
  components: { Header},
  data()  {
    return {
      logged: LOGGED.PENDING,
      user: new User('', '', '', [], [], false,
       0, 0, 'offline', 'rank'),
      errorMessage: '',
      usersLogged: [] as User[],
      socket_online: io(),

    }
  },
  beforeMount() {
    this.updateInfos()
  },
  methods: {
    updateInfos() {
      axios
          .get('/api/users/profile', options)
          .then(response => {
            this.logged = LOGGED.LOGGED,
            
            this.user.username = response.data.username
            this.user.id = response.data.id.toString()
            this.user.avatar = response.data.avatar + '?' + rdmStr(5)
            this.user.blocked = response.data.blocked
            this.user.friends = response.data.friends
            this.user.victories = response.data.victories;
            this.user.losses = response.data.losses;
            this.user.status = response.data.status;
            this.user.is_admin = response.data.is_admin;
            this.user.twoFA =  response.data.twoFA;
            this.user.games = response.data.games;

            this.errorMessage = ''
            this.socket_online = io('http://localhost:3000/connection', {  withCredentials: true })

          })
          .catch(error => {
            this.logged = LOGGED.NOTLOGGED,
            this.errorMessage = error
          })
    },
    updateLogged(value: LOGGED) {
      this.logged = value;
    },
    isTWOFA(): boolean {
     return this.$router.currentRoute.value.name == 'TWOFA'
    }
  },
})
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #141414;
    display: flex;
    flex-direction: column;
    align-items: center;

  }

  body {
    background-color: #fff;
    display: flex;
    height: 100vh;
    width: 100vw;

    justify-content: center;
    align-content: center;
    margin: 0;
    overflow: hidden
  }


  .title {
        font-weight: bold;
    }

  .invisible {
    visibility: hidden;
}

    .offline {
        color: red;
        font-size: 10px;
    }

    .online {
        color: #00503c;
        font-size: 10px;
    }

    .error {
        color: #ff0062;
        margin-top: 9px;
        font-size: 0.8em;
        font-weight: bold;
    }

    input {
      border-radius: 25px;
      border: 2px solid #4682B4;
      padding: 4px;
      margin: 4px;
    }

    .connect {
    background: #00503c;
    border: 4 solid;
    padding: 10px;
    color: #ffffff;
    margin: 20px;
    height: 40px;
    border-radius: 20px;
    text-align: center;
    cursor: pointer; 
    
  }

   .all_page {
      color: black;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
  }

  .content {
    width: 100%;
    height: 100%;
  }


  i {
    cursor: pointer; 

  }
</style>



NOIR: #141414
VERT: #00503c
GREY DARK: #3c3b3b
bleu: 
orange: #c85a19
blanc cassé: #e1e1e1
grey: #848484


C0uc0u-Guill@ume