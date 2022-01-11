<template>
    <div id="conv_list">
        <div>
            <div class="all_conv" v-if="rooms[0]">  
                <div class="list_conv">
                    <h4>Public chats</h4>
                            <div class="conv_grid">
                        <li v-for="room in publicRooms" :key="room.id">
                                <div v-bind:style= "[room.id == roomSelected ? {'background-color': '#00aa80' } : {'background-color': '#00503c' }]"  class="conv" @click="checkRoomType(room)"> {{ room.title }} <br> Users: {{ room.users.length }} </div>
                        </li>
                            </div>
                </div>
                <div class="list_conv">
                    <h4>Protected chats</h4>
                    <div class="conv_grid">
                        <li v-for="room in protectedRooms" :key="room.id">
                            <div v-bind:style= "[room.id == roomSelected ? {'background-color': '#00aa80' } : {'background-color': '#00503c' }]" v-if="room.id != askPassword" class="conv" @click="checkRoomType(room)"> {{ room.title }} <br> Users: {{ room.users.length }} </div>
                            <div  v-if="room.id == askPassword">
                                <input class="input_password" @keyup.enter="checkRoomType(room)"  v-if="room.status == 'protected'" type="password" v-model="password" placeholder="password">
                            </div>
                        </li>
                    </div>
                </div>
                <div class="list_conv">
                    <h4>Private chats</h4>
                    <div class="conv_grid">
                        <li  v-for="room in privateRooms" :key="room.id">
                        <div v-bind:style= "[room.id == roomSelected ? {'background-color': '#00aa80' } : {'background-color': '#00503c' }]" class="conv" @click="checkRoomType(room)"> {{ room.title }} <br> Users: {{ room.users.length }} </div>
                        </li>
                    </div> 
                </div> 
            </div>
            <p v-else>NO CHAT AVAILABLE</p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import RoomI from '../../types/interfaces/Room.interface'


export default defineComponent({
    components: {  },
    data() {
        return {
            errorMessage: '',
            askPassword: -1,
            password: '', 
        }
    },
    props: {
        rooms: {
            required: true,
            type: Object as () => RoomI[]
        },
        roomSelected: {
            required: true,
            type: Number,
        }
    },
    emits: [ 'join-room'],
    methods: {
        checkRoomType(room: RoomI) {
            if (room.status == 'public' || room.status == 'private')
                this.askPassword = -1;
            if (room.status == 'protected' && this.password == '') {
                if (room.id != undefined)
                    this.askPassword = room.id
            }
            else 
                this.joinRoom(room)
        },
        joinRoom(room: RoomI) {
            let tmpRoom = room;
            tmpRoom.password = this.password;      
            this.$emit('join-room', tmpRoom);
            this.password = ''
            this.askPassword = -1
        }
    },
    computed: {
        publicRooms() : RoomI[] {
            return  this.rooms.filter((element: RoomI) => { return element.status === 'public' }); 
        },
        privateRooms() : RoomI[] {
            return  this.rooms.filter((element: RoomI) => { return element.status === 'private' }); 
        },
        protectedRooms() : RoomI[] {
            return  this.rooms.filter((element: RoomI) => { return element.status === 'protected' }); 
        }
        
    }
})
</script>

<style scoped>

    .input_password {
        width: 75px;
        border-radius: 4px;
        border: 2px #00503c solid;
    }
   
    .conv {
        font-size: 85%;
        color: white;
        cursor: pointer;
        width: 100%;
        height: 100%;
        /* min-width: 100px; */
        /* background-color: #00aa80; */
        /* background-color: #00503c; */
        overflow:hidden;
        border: solid 0.5px #00503c;
        padding: 3px;
        border-radius: 25px;
    }

    #conv_list {
        display: flex;
        justify-content: center;
        width: auto;
        min-width: 100%;
        max-height: 600px;
        overflow: auto;
    }

    .all_conv {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        width: 100%;
        min-width: 100%;
    }


    .list_conv {
        display: flex;
        /* align-items: column; */
        flex-direction: column;
        align-content: flex-start;
        width: 100%;
        min-width: 100%;
        /* overflow: scroll; */
    }


    .list_conv li {
        list-style-type: none;
        display: flex;
        flex-direction: row;
        width: auto;
        overflow: hidden;
        min-width: 47%;
        margin: 3px;
        align-items: center;
    }

    h4 {
    /* text-decoration: underline; */
        border: 0px;
        border-bottom: 3px solid #00503c;
        padding-bottom: 3px;
        width: 100%;
    }


    .conv_grid {
        display: flex;
        flex-direction: row;
        width: 100%;
        align-items: center;
        flex-wrap: wrap;
        /* background-color: #00503c; */
        border-radius: 25px;
    }

</style>