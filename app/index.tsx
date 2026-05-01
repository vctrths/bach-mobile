import Button from "@/components/ui/Button";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { H1, YStack } from "tamagui";

export default function Landing() {
  return (
    <SafeAreaView>
      <YStack padding="$4" gap="$8">
        <H1 textAlign="center">Welkom bij Groene Vingers</H1>
        <Button
          label="Leer bij over onze app"
          onPress={() => router.push("/onboarding")}
        />
      </YStack>
    </SafeAreaView>
  );
}
