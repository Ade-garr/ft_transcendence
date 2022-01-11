import { ref } from 'vue'


const getUser = (uuid: string) => {
    const user = ref([])
    const errorUser = ref(null)

    const loadUser = async () => {
      try {
        const data = await fetch('http://0.0.0.0:3090/' + uuid )

        if (!data.ok) {
          throw Error('there is an issue')
        }

        user.value = await data.json()
      }
      catch (err : any) {
        errorUser.value = err.message
      }
    }
    return { user, errorUser, loadUser }
}

export default getUser