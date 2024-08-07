import { Stack } from 'expo-router/stack';
import { DataProvider } from '../DataContext';
import { RealDataProvider } from '../RealTimeContext';

export default function Layout() {
  return (
    <RealDataProvider>
    <DataProvider>
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="authentication" options={{ headerShown: false }} /> 
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
    </DataProvider>
    </RealDataProvider>
  );
}
