<template>
    <div class="conv_creation">
        <h3>Create new chat</h3>
        Name <input type="text" maxlength="12" v-model="title" placeholder="Le poulet c'est trop genial" class="input_name" />
        <div id="chosing_type">
            <div class="one_elem">
                <input type="radio" value="public" v-model="privacy"/>
                <label for="public">Public</label>
            </div>
            <div class="one_elem">
                <input type="radio" value="protected" v-model="privacy" />
                <label for="protected">Protected</label>
            </div>
            <div class="one_elem">
                <input type="radio" value="private" v-model="privacy" />
                <label for="private">Private</label>
            </div>        
        </div>
        <div  v-if="privacy == 'protected'">
            <input  class="input_password" type="password"  v-model="password" placeholder="password" required>
            <p>*Minimun 5 characters</p>
        </div> 
        <button v-if="privacy != '' && title != ''" @click="createChat">create</button>
    </div>
</template>

<script lang="ts">

import { defineComponent, PropType } from 'vue'
import User from '../../types/User'
import RoomI from '../../types/interfaces/Room.interface'

export default defineComponent({
    props: {
        userid : {
            required: true,
            type: String,
        },
        user: {
            type: User as PropType<User>,
            required: true
        }
    },
    emits: [ 'create-chat'],
    data() {
        return {
            users: [] as User[],
            selected: '',
            password: '',
            title: '',
            privacy: '',
        }
    },
    methods: {
        createChat() {
            if (this.title == '' ||
            (this.privacy == 'protected' && (this.password == '' || this.password.length < 5 ))) return ;
            let room = {
                title: this.title,
                users: [this.user],
                status: this.privacy,
                admins: [parseInt(this.user.id, 10)],
                password: this.password,
                owner: this.user.id
            } as RoomI
            this.$emit('create-chat', room);
            this.password = '';
            this.title = '';
        }
    } 
})

</script>

<style scoped>

    .conv_creation {
        background-color: #fff;
        padding: 1px;
        border: solid 0.5px #cfccca;
        display: flex;
        align-items: center;
        flex-direction: column;
    }

    .input_name {
        width: 180px;
        border-radius: 4px;
        border: 2px grey solid;
    }

    input[type=text]:focus{
        border: 3px solid #00503c;  
        outline: 0px;   /* oranges! yey */
    }

    input[type=password]:focus{
        border: 3px solid #00503c;  
        outline: 0px;   /* oranges! yey */
    }

    .input_password {
        border: 2px solid grey;
        border-radius: 4px;
        margin: 0;

    }

    p {
        font-size: 15px;
        font-style: italic;
    }

    #chosing_type {
        display: flex;
    }

    .one_elem {
        display: flex;
        flex-direction: column;
        margin: 10px;
    }

</style>

