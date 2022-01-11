
  async function toggleBlocked(userid : string) : Promise<string> {
    const response = await fetch('/api/users/profile/blocked/' + userid, {
        method: 'POST',  credentials: 'include' })
      if (!response.ok) { 
        
        throw Error('there is an issue')
      }
      else return ('all good')
}

export default toggleBlocked