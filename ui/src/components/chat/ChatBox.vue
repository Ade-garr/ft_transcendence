<template>
    
    <div id="chat_box">
        <div class="message_line" v-for="message in messages" :key="message.id">
            <div v-if="message.user.id != user.id" class="others_messages">
                <router-link :to="{ name: 'profile_others', params: { userid: message.user.id }}" class="message_username">{{ message.user.username }}</router-link>   
                             
                : <div v-if="message.challenger == -1" class="other_message_body">{{ message.content }}</div>
                <div v-else class="other_message_body"><router-link :to="{ name: 'game', params: { gameid: message.game }}">{{ message.content }}</router-link></div>
            </div>   
            <div v-else class="my_messages">
                <div class="my_message_body">{{ message.content }}</div>
            </div>
        </div>
    </div>

</template>

<script lang="ts">

import { defineComponent } from 'vue'
import { PropType } from 'vue'


import RoomI from '../../types/interfaces/Room.interface'
import MessageI from '../../types/interfaces/Message.interface'
import User from '../../types/User'

export default defineComponent({
    components: {  },
    data() {
        return {
            errorMessage: '',
            mode: 'conv'
        }
    },
    props: {
        user : {
            required: true,
            type: User as PropType<User>,
        },
        messages: {
            required: true,
            type: Object as () => MessageI[]
        },
        roomSelected : {
            required: true,
            type:  Object as () => RoomI
        }
    },
    emits: [ 'send-msg'],
    methods: {
        isAdmin(userid: string) : boolean {
            for (let i = 0; i < this.roomSelected.admins.length; i++) {
                if (this.roomSelected.admins[i].toString() == userid)
                    return true
            }
            return false;
        },
        isOwner(userid: string) : boolean {
            return (this.roomSelected.owner == userid ? true : false)
        },
        changeMode(mode: string) {
            this.mode = mode 
        }
  },
  updated() {
      let element = document.getElementById("chat_box");
    if (!element) return ;
    element.scrollTop = element.scrollHeight;
  }
})

</script>

<style scoped>

    .chat_space {
        min-width: 100%;
        min-height: 100%;
    }

    .title {
        margin: 8px;
        width: 96%;
        display: flex;
        /* align-items: flex-end; */
        justify-content: space-between;
        border-bottom: 1px solid #cfccca;
        min-height: 7%;
    }

    span {
        color: grey;
        font-size: 12px;   
        margin: 2px; 
    }

    h4 {
        color: green;
        margin: 0;
        font-style: bold;
        margin: 2px;

    }

    #instruction {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .all_space {
        width: 100%;
        height: 100%;
    }


    .profile {
        
        margin: 5px;
        padding: 3px;

    }


    .message_username {
        font-size: 75%;
        font-weight: bold;
        color: black;
        text-decoration: underline;
    }

    #message_space {  
        min-height: 100%;
        border-radius: 0px; 
    }

    #chat_box {
        height: 400px;
        border: solid 0.5px grey;
        border-radius: 2px;
        display: flex;
        align-items: center;
        flex-direction: column;
        /* min-width: 100%;
        min-width: 100%; */
        margin-left: 5px;
        /* max-width: 50%; */
        max-height: 400px;
        padding-right: 5px;
        padding-left: 5px;
        padding-bottom: 5px;
        overflow-y: scroll;
        overflow-x: hidden;
        scroll-snap-type: y proximity;

    }

    .message_line {
        margin-left: auto;
        width: 100%;
        margin: 5px;
        /* background-color: black; */

    }

    .my_message_body {
        max-width: 50%;
        overflow-wrap: break-word;
        font-size: 15px;
        max-width: 40%;
        color: white;
        background-color: #00503c;
        margin-right: 10px;
        padding: 6px;
        border-radius: 20px;
    }

    .other_message_body {
        max-width: 50%;
        overflow-wrap: break-word;
        font-size: 15px;
        max-width: 40%;
        color: white;
        background-color: #00aa80;
        margin: 0px;
        border-radius: 20px;
        padding: 5px;
        margin-right: 10px;
    }

    
    .my_messages {
        /* background-color: #00503c; */
        border-radius: 20px;
        text-align: right;
        max-width: 100%;
        display: flex;
        flex-direction: row-reverse;

    }

    .others_messages {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        width: 100%;
        align-items: center;
        /* background-color: grey; */
    }

    img {
        width: 25px;
        height: 25px;
        margin: 5px;
    }
</style>


