import { router } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled, YStack } from "tamagui";

const ThemedSafeArea = styled(SafeAreaView, {
  flex: 1,
  backgroundColor: "$canvas",
});

export default function Landing() {
  useEffect(() => {
    router.replace("/");
  }, []);

  return (
    <ThemedSafeArea>
      <YStack flex={1} paddingHorizontal="$6" justifyContent="center"></YStack>
    </ThemedSafeArea>
  );
}
