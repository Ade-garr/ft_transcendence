import { reactive } from 'vue'


const user = reactive({
    username: '',
    id: '',
    avatar: '',
    role: ''
})

export default {
    user
}