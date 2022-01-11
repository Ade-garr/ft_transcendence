import { ref } from 'vue'


const getUsers = () => {
    const users = ref([])
    const errorUsers = ref(null)

    const loadUsers = async () => {
      try {
        const data = await fetch('/api/users')//call for nst

        if (!data.ok) {
          throw Error('there is an issue')
        }

        users.value = await data.json()
      }
      catch (err : any) {
        errorUsers.value = err.message
      }
    }
    return { users, errorUsers, loadUsers }
}


export default getUsers