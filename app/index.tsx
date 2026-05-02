import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { router } from "expo-router";
import { H1, Image, YStack } from "tamagui";



export default function Landing() {
  return (
    <ThemedSafeArea>
      <YStack flex={1} padding="$4" justifyContent="space-between">

        <YStack flex={1} justifyContent="center" alignItems="center" marginTop="$8">
          <Image
            src={require("@/assets/images/hero.png")}
            width="100%"
            height={450}
            objectFit="contain"
          />
        </YStack>

        <YStack gap="$8" marginBottom="$6">
          <H1 textAlign="center" color="$primary" fontWeight="bold">
            Welkom bij{"\n"}Groene Vingers
          </H1>
          <Button
            label="Leer bij over onze app"
            backgroundColor="$background"
            color="$white"
            onPress={() => router.push("/onboarding")}
          />
        </YStack>

      </YStack>
    </ThemedSafeArea>
  );
}
