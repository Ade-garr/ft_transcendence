<template>
    <div class="card_settings">
        <div>
            <h3>Change profile</h3>
        </div>
        <div >
            <span>My new username is: </span>
            <input maxlength="10" type="text" v-model="new_username" placeholder="edit me" /><br>
            <button class="orangebutton" @click="updateUsername">Update username</button>
        </div>
        <div >
            <span>Change profile pic</span>
            <input type="file" accept="image/*" @change="uploadImage($event)" id="file-input">
        </div>
        
        <p class="error" v-if="errorMessage != ''">{{ errorMessage }}</p>
            <div v-if="this.url != ''">
                <br><img :src="this.url"> <br>
                <input type="text" v-model="TwoFAcode">
                <button  @click="verify2FA">Send code</button>
            </div>
        <div id="danger">
            <button  class="greenbutton" v-if="!user.twoFA" @click="set2FA">Activate 2Auth</button>
            <button class="orangebutton" v-if="user.twoFA" @click="disable2FA">Disable 2Auth</button>
            <button class="orangebutton" @click="loggout">Loggout</button>
            <button class="orangebutton" @click="delAccount">Delete account</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import User from '../../types/User'
import axios from 'axios';

export default defineComponent({
    props: {
        user: {
        type: User as PropType<User>,
        required: true
        }
    },
    data() {
        return {
            new_username: this.user.username,
            new_avatar: this.user.avatar,
            errorMessage: '',
            url: '',
            TwoFAcode: ''
        }
    },
    emits: [ 'need-update'],
    methods: {
        updateUsername() {
            if (this.new_username == '') return ;
            let data = 'username=' + this.new_username;
            axios
                .post('/api/users/profile/username', data , { withCredentials: true })
                .then(response => {
                    if (response.status == 201)
                        this.needUpdate() 
                    
          })
          .catch(error => {
              this.errorMessage = error;
            this.errorMessage = 'Verification failed, please retry.'
          })
          this.new_username = '';
        },
        uploadImage(event: any) {
            const URL = '/api/users/profile/upload'; 

            let data = new FormData();
            data.append('avatar', event.target.files[0]); 
            let config = {
            headers : {
                'Content-Type' : 'image/png'
                }
            }
            axios.post(URL, data, config)
            .then( response => { 
                this.needUpdate() 
            })
        },
        set2FA() {
            axios
                .get('/api/users/profile/enable-2FA', { withCredentials: true })
                .then(response => {
                    this.url = response.data.url;
          })
          .catch(error => {
                    this.errorMessage = 'An error occured ' + error
          })


        },
        verify2FA() {
            if (this.TwoFAcode == '') return ;
            let data = 'code=' + this.TwoFAcode;
            axios
                .post('/api/users/profile/verify-2FA', data , { withCredentials: true })
                .then(response => {
                    if (response.status == 201) {
                        this.url = ''
                        this.needUpdate()
                    }
                })

                .catch(error => {
                this.errorMessage = 'An error occured ' + error
          })
        },
        disable2FA() {
            axios
                .get('/api/users/profile/disable-2FA', { withCredentials: true })
                .then(response => {
                    if (response.status == 200)
                        this.needUpdate() 
                })
                .catch(error => {
                this.errorMessage = 'An error occured ' + error
          })
        },
        needUpdate() {
            this.$emit('need-update');
        },
        loggout() {
            axios
                .get('/api/users/profile/logout', { withCredentials: true })
                .then(response => {
                    if (response.status == 200) {
                        this.needUpdate()
                    }
                    
                })
                .catch(error => {
                this.errorMessage = 'An error occured ' + error
          })
        },
        delAccount() {
            axios
                .delete('/api/users/profile/', { withCredentials: true })
                .then(response => {
                    if (response.status == 200) {
                        this.needUpdate()
                    }
                })
                .catch(error => {
                this.errorMessage = 'An error occured ' + error
          })
        },
    }
})
</script>

<style scoped>


    .card_settings {
        background-color: #cecece;
        width: 30%;
        height: 100%;
        padding: 1px;
        border-radius: 10px;
        border: solid 0.5px #4682B4;
        display: flex;
        align-items: center;
        flex-direction: column;
        margin: 10px;
    }


    .greenbutton {
        background-color:  #00503c;

        border: 0;
        border-radius: 12px;
        color: #FFFFFF;
        cursor: pointer;
      
        padding: 4px;
        margin: 5px;
    }

    .orangebutton {
        background-color: #c85a19;
        border: 0;
        border-radius: 12px;
        color: #FFFFFF;
        cursor: pointer;
        margin: 5px;
      
        padding: 4px;
    
     
    }

    input[type="file"] {
        cursor: pointer;
}

    #danger{ 
        display: flex;
        align-items: center;
        margin: 10px;
    }
</style>