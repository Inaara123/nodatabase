import { Stack } from 'expo-router/stack';
export default function Layout() {
  return (
    <Stack >
      <Stack.Screen 
      name='Settings' 
      options={{headerShown:false,
        gestureEnabled: false,
      }}
      />
      <Stack.Screen name='ProfileForm'
      options={{headerShown:false,
        gestureEnabled: false,
      }}
      />
            <Stack.Screen name='ProfileModify'
      options={{headerShown:false,
        gestureEnabled: false,
      }}
      />
    </Stack>
  );
}