import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, Stack } from 'expo-router';
import {UserProvider} from '../../UserContext';


export default function TabLayout() {
  return (
    <UserProvider>

      
      <Tabs initialRouteName='home'  
      screenOptions={{ tabBarActiveTintColor: 'blue', 
      headerShown : false,
      tabBarActiveTintColor: '#6C5CE7', // Rich Purple
          tabBarInactiveTintColor: '#A9A9A9', // Light Gray
          tabBarStyle: {
            backgroundColor: '#0E0F19', // Dark Midnight Blue
            borderTopColor: 'transparent', // Remove border shadow
            height: 60,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Poppins_400Regular',
            fontWeight: '600',
          },
      
      }}>
      

        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            
    

            
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
          }}
        />
       <Tabs.Screen
          name="shuffle"
          options={{
            title: 'Shuffle',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="random" color={color} />,
          }}/>
       <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
          }}
        />
     

      </Tabs>
   
    </UserProvider>

  
  )}