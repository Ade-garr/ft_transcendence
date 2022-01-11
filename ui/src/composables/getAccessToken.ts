import { ref } from 'vue'

const getAccessToken = () => {
    const token = ref([])
    const errorToken = ref(201)

    const loadToken = async (code : string) => {
        try {
          const data = await fetch('http://localhost:3000/api/auth/token', {
                    method: 'POST',
                    body: code,
                    headers: {'Content-Type': 'text/plain; charset=UTF-8'} 
                })
            if (data.status != 201)
                errorToken.value = data.status
            token.value = await data.json()
        }
        
      catch (err : any)  {
        errorToken.value = err.message
      }
    }
    return { token, errorToken, loadToken }
}

export default getAccessToken
