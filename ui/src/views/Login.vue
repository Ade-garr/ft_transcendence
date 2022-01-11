<template>
<div class="all_page">
    <a class="connect" href="http://localhost:3000/api/auth/login">Connect/create account using 42 Connect</a>
</div>

 

</template>

<script lang="ts">
import { LOGGED } from '../types/enums/login.enum'
import { defineComponent } from 'vue'

export default defineComponent({
    props: {
        logged: {
            type: String,
            validator: (val: LOGGED) => [LOGGED.LOGGED, LOGGED.PENDING, LOGGED.NOTLOGGED].includes(val),
            required: true
        }
    },
    mounted() {
        if (this.logged == LOGGED.LOGGED)
            this.$router.push('/profile')
    },
})
 
</script>

<style scoped>
    .connect {
    background: #00503c;
    border: 0;
    padding: 10px 20px;
    margin-top: 20px;
    color: white;
    border-radius: 20px;
    cursor: pointer;
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
</style>


