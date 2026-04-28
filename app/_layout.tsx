import { Stack } from 'expo-router';
import { TamaguiProvider } from 'tamagui';

import tamaConfig from '@/tamagui.config';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaConfig}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </TamaguiProvider>
  );
}
