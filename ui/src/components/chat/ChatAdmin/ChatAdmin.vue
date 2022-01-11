<template>
    <div class="card" id="chat_admin">
           <OwnerOptions v-if="isOwner(user.id)" :user="user" :roomSelected="roomSelected" ></OwnerOptions>
           <AdminOptions v-if="isAdmin(user.id)" :user="user" :roomSelected="roomSelected" ></AdminOptions>
    </div>
</template>

<script lang="ts">

import { defineComponent , PropType} from 'vue'
import RoomI from '../../../types/interfaces/Room.interface'
import User from '../../../types/User'
import OwnerOptions from './OwnerOptions.vue';
import AdminOptions from './AdminOptions.vue';

export default defineComponent({
    components: { OwnerOptions, AdminOptions },
    props: {
        user : {
            required: true,
            type: User as PropType<User>,
        },
        roomSelected : {
            required: true,
            type:  Object as () => RoomI
        },
    },
    methods: {
        isAdmin(userid: string) : boolean {
            if (this.isOwner(userid)) return true;
            for (let i = 0; i < this.roomSelected.admins.length; i++) {
                if (this.roomSelected.admins[i].toString() == userid)
                    return true
            }
            return false;
        },
        isOwner(userid: string) : boolean {
            return (this.roomSelected.owner == userid ? true : false)
        },
    }
})

</script>

<style scoped>

    input {
        max-width: 100px;
    }
    .chat_admin {
        color: black;
  }

   .card {
        background-color: #fff;
        min-width: 200px;
        min-height: 200px;
        max-width: 800px;
        max-height: 800px;
        width: 100%;
        height: 100%;
        padding: 1px;
        border: solid 0.5px #cfccca;
        display: flex;
        align-items: center;
        flex-direction: column;
    }

</style>


