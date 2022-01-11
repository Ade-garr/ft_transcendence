import { ref } from 'vue'


const getAllChats = () => {
    const chats = ref([])
    const errorChats = ref(null)

    const loadChats = async () => {
      try {
        const data = await fetch('http://0.0.0.0:3110/Chats')
        if (!data.ok) {
          throw Error('there is an issue')
        }
        chats.value = await data.json()
      }
      catch (err : any)  {
        errorChats.value = err.message
      }
    }
    return { chats, errorChats, loadChats }
}

export default getAllChats