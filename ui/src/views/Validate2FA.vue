<template>
    <div class="all_page">
        Send 2FA code
        <input type="text" v-model="TwoFAcode">
        <button @click="validate2FA">Send code</button>
        {{ errorMessage }}
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios';
import { LOGGED } from '../types/enums/login.enum'




export default defineComponent({
    data() {
        return {
            errorMessage: '',
            TwoFAcode: ''
        }
    },
    props: {
        logged: {
            type: String,
            validator: (val: LOGGED) => [LOGGED.LOGGED, LOGGED.PENDING, LOGGED.NOTLOGGED].includes(val),
            required: true
        }
    },
    emits: [ 'need-update', 'update-logged'],
    methods: {
        validate2FA() {
            if (this.TwoFAcode == '') return ;
            let data = 'code=' + this.TwoFAcode;
            axios
                .post('/api/auth/validate2FA', data , { withCredentials: true })
                .then(response => {
                    this.$emit('need-update');
                    this.$emit('update-logged', LOGGED.LOGGED)
                    this.$router.push('/multiplayer');
                })
                .catch(error => {
                this.errorMessage = 'Verification failed, please retry.'
          })
        }
    },
})
</script>

<style scoped>



  .all_page {
      color: black;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
  }
</style>