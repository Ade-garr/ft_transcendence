
  async function toggleFriend(friend : string) : Promise<string> {
    const response = await fetch('/api/users/profile/friends/' + friend, {
        method: 'POST',  credentials: 'include' })
      if (!response.ok) { 
        throw Error('there is an issue')
      }
      else return ('all good')
}

export default toggleFriend