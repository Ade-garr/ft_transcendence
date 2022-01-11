<template>
<div id="multiplayer_div">

    <UserListing class="listUsers" :userid="parseInt(user.id)" @need-update="needUpdate"/>
    <GamesListing :userid="parseInt(user.id)" />
</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import UserListing from '../components/multiplayer/UserListing.vue'
import GamesListing from '../components/multiplayer/GamesListing.vue'
import { LOGGED } from '../types/enums/login.enum'

import addFriend from '../composables/toggleFriend'
import User from '../types/User'


export default defineComponent({
    components: { UserListing, GamesListing },
    data() {
        return {
            testV: {x: 0, y: 0 },
            dist: 0
        }
    },
    props: {
        user: {
            type: User as PropType<User>,
        required: true
        },
        logged: {
            type: String,
            validator: (val: LOGGED) => [LOGGED.LOGGED, LOGGED.PENDING, LOGGED.NOTLOGGED].includes(val),
            required: true
        } 
    },
    emits: [ 'need-update'],
    methods: {
        callAddFriend: function (username: string) {
            addFriend(username)
        },
		gamePath(id: string) : string {
			return ('/games/' + id)
		},
        needUpdate() {
            this.$emit('need-update')   
        },
    },
    mounted() {
        if (this.logged == LOGGED.LOGGED)
            this.$emit('need-update')
    },
})
</script>

<style scoped>


    #multiplayer_div {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-evenly;
        width: 100%;
    }

@media (min-width: 768px) {
 
}


</style>



