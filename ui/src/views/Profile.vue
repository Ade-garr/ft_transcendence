<template>
    <div class="profile">
        <ProfileCard :user="user"/>
        <SocialCard :user="user" />
        <SettingsCard @need-update="needUpdate" :user="user"/>
    </div>

</template>

<script lang="ts">

import { PropType } from 'vue'
import { defineComponent } from 'vue'
import User from '../types/User'
import ProfileCard from '../components/profile/ProfileCard.vue'
import SocialCard from '../components/profile/RelationsCard.vue'
import SettingsCard from '../components/profile/SettingsCard.vue'
import { LOGGED } from '../types/enums/login.enum'


export default defineComponent({
    components: {  ProfileCard, SocialCard, SettingsCard},
    props: {
        user: {
            type: User as PropType<User>,
            required: true
        },
        logged: {
            type: String,
            validator: (val: LOGGED) => [LOGGED.LOGGED, LOGGED.PENDING, LOGGED.NOTLOGGED].includes(val),
            required: true
        },
        // usersLogged: {
        //     type: [] as PropType<User[]>,
        //     required: true
        // },
    },
    methods: {
        needUpdate() {
            this.$emit('need-update');
        }
    },
    emits: [ 'need-update'],
    mounted() {
        if (this.logged == LOGGED.LOGGED)
            this.$emit('need-update')
    },
})
</script>

<style scoped>

    .profile {
        display: flex;
        
        flex-direction: row;
        justify-content: space-evenly;
        flex-wrap: wrap;
        align-items: space-between;
    }

    .avatar_listing {
        width: 30px;
        height: 30px;
        border-radius: 20%;
    }

    
</style>