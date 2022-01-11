<template>
  <div>
  there is an issue in your url mate
</div>

</template>

<script lang="ts">
// import User from '../types/User'
import {  defineComponent } from 'vue'
import { LOGGED } from '../types/enums/login.enum'

export default defineComponent({
    mounted() {
        if (this.logged == LOGGED.NOTLOGGED)
            this.$router.push('/login')
    },
    props: {
        logged: {
            type: String,
            validator: (val: LOGGED) => [LOGGED.LOGGED, LOGGED.PENDING, LOGGED.NOTLOGGED].includes(val),
            required: true
        }
    },
  
})
</script>

<style scoped>
  
</style>


