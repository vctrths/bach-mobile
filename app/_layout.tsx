import tamaConfig from "@/tamagui.config";
import { Stack } from "expo-router";
import { TamaguiProvider } from "tamagui";

export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaConfig} defaultTheme="groenevingers">
      <Stack screenOptions={{ headerShown: false }} />
    </TamaguiProvider>
  );
}
