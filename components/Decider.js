import React from 'react'
import WelcomeScreen from './WelcomeScreen'
import { Redirect } from 'expo-router'
import { UserContext } from '../UserContext'
import { useContext } from 'react'

const Decider = () => {
    const {userData} = useContext(UserContext);
    if (Object.keys(userData).length > 0){ {
        return <Redirect href="/(tabs)/home/HomePage" />  
    }
    }else{
        return <WelcomeScreen />
    }

}

export default Decider