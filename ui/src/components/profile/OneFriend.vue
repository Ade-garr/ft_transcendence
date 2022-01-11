<template>

    <div>
        <span id="username" @click="seeProfile(user.id)">{{ user.username }}</span>
        <span v-if="user.status == 'online'" class="dot" id="online"></span>
        <span v-if="user.status == 'offline'" class="dot" id="offline"></span>
        <span v-if="user.status == 'in a game'" class="dot" id="inagame"></span>
        <button class="orangebutton" @click="rmvFriend" >Unfriend</button> 
    
    </div>
</template>


<script lang="ts">

import { defineComponent, PropType } from 'vue'
import toggleFriend from '../../composables/toggleFriend'
import User from '../../types/User'

export default defineComponent({
    props: {
        user: {
        type: User as PropType<User>,
        required: true
        }
    },
    emits: ['need-update', 'to-display'],
    methods: {
        rmvFriend() {
            toggleFriend(this.user.id)
            .then(() => this.$emit('need-update'))
            .catch((err) => this.$emit('to-display', err))
            // check return
            this.$emit('need-update')
            },
        seeProfile(id: string) {
            this.$router.push('/profile/' + id);
        }
    }
})
</script>

<style scoped>

#username {
    cursor:pointer;
    text-decoration: underline;
    color: #00327e;
    margin: 5px;
}

.dot {
    height: 10px;
    width: 10px;
    border-radius: 50%;
    display: inline-block;
    margin: 5px;

}

#online {
    background-color: #00503c;
}

#offline {
    background-color: red;
}

#inagame {
    background-color: #c85a19;
}


.orangebutton {
    margin-left: 10px;
}

div {
    display: flex;
    align-items: center;
}


</style>

