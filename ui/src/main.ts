import { createApp, reactive } from 'vue'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { LOGGED } from './types/enums/login.enum'



const app = createApp(App)
const store =  {  logged: 'SALUT',
    set(value: string) {
        store.logged =  value       
    }
}

app.config.globalProperties.$store = store

app.use(router).mount('#app')



// App.use(Socketio, {
//     connection: 'http://localhost:3000/chat',
//     options: {
//         withCredentials: true
//     }
// })