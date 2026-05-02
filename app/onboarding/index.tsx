import Onboarding from "@/components/ui/Onboarding";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled, YStack } from "tamagui";

const ThemedSafeArea = styled(SafeAreaView, {
  flex: 1,
  backgroundColor: "$canvas",
});

export default function Landing() {
  return (
    <ThemedSafeArea>
      <YStack
        flex={1}
        paddingHorizontal="$6"
        justifyContent="center"
      >
        <Onboarding />
      </YStack>
    </ThemedSafeArea>
  );
}
