<template>
    <div >
        <span>{{ user.username }}</span>
        <button class="orangebutton" @click="rmvBlock" >Unblock</button> 
    </div>
</template>


<script lang="ts">

import { defineComponent, PropType } from 'vue'
import toggleBlocked from '../../composables/toggleBlocked'
import User from '../../types/User'

export default defineComponent({
    props: {
        user: {
        type: User as PropType<User>,
        required: true
        }
    },
    emits: ['need-update', 'to-display'],
    data() {
        return {
            errorMessage: ''
        }
    },
    methods: {
        rmvBlock() {
            toggleBlocked(this.user.id)
            .then(() => this.$emit('need-update'))
            .catch((err) => this.$emit('to-display', err))
            this.$emit('need-update')
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

