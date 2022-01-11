import { ref } from 'vue'


const getOnGoingGames = () => {
    const games = ref([])
    const errorGames = ref(null)

    const loadGames = async () => {
      try {
        const data = await fetch('http://0.0.0.0:3100/games')
        if (!data.ok) {
          throw Error('there is an issue')
        }
        games.value = await data.json()
      }
      catch (err : any)  {
        errorGames.value = err.message
      }
    }
    return { games, errorGames, loadGames }
}

export default getOnGoingGames