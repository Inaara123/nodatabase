import { Stack } from 'expo-router/stack';
import { DataProvider } from '../DataContext';
import { RealDataProvider } from '../RealTimeContext';
import { HospitalProvider } from '../HospitalContext';

export default function Layout() {
  return (
    <RealDataProvider>
    <HospitalProvider>
    <DataProvider>
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="authentication" options={{ headerShown: false }} /> 
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
    </DataProvider>
    </HospitalProvider>
    </RealDataProvider>
  );
}
