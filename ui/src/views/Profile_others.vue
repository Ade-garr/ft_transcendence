<template>
    <div class="profile">
        <ProfileCard :user="user"/>
    </div>

</template>

<script lang="ts">

// import { PropType } from 'vue'
import { defineComponent } from 'vue'
import User from '../types/User'
import ProfileCard from '../components/profile/ProfileCard.vue'
import axios from 'axios';
import { LOGGED } from '../types/enums/login.enum'

export default defineComponent({
    components: {  ProfileCard},
    data() { return {
        user: new User('', '', '', [], [], false,
       0, 0, 'offline', 'rank'),
       errorMessage: ''
       }
    },
    props: {
        logged: {
            type: String,
            validator: (val: LOGGED) => [LOGGED.LOGGED, LOGGED.PENDING, LOGGED.NOTLOGGED].includes(val),
            required: true
        }
    },
    mounted() {
        this.updateInfos()
    },
    methods: {
        updateInfos() {
            axios
                .get('/api/users/' + this.$route.params.userid.toString(), { withCredentials: true })
                .then(response => {
                    this.user.username = response.data.username
                    this.user.id = response.data.id.toString()
                    this.user.avatar = response.data.avatar
                    this.user.games = response.data.games
                    //this.user.victories = response.data.victories;
                    this.user.is_admin = response.data.is_admin;
                    //this.user.rank = response.data.rank;

                    this.errorMessage = ''
                })
                .catch(error => {
                    this.errorMessage = 'Error! Could not reach the API. ' + error
            })
        }
    }

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