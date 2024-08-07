import { Stack } from 'expo-router';
import { UserProvider } from '../../UserContext';

export default function Layout() {
  return (
    <UserProvider>
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>

      <Stack.Screen name="SignIn" options={{headerShown:false}} />
      <Stack.Screen name="SignUp" options={{headerShown:false}} />
    </Stack>
    </UserProvider>
  );
}
