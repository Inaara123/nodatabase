import Decider from '../components/Decider'
import React from 'react'
import { UserProvider } from '../UserContext'


const index = () => {

  return (
    <UserProvider>
      <Decider />
    </UserProvider>
  )
}

export default index