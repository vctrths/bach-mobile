import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { router } from "expo-router";
import { H1, YStack } from "tamagui";

import Logo from "@/assets/images/logo.svg";

export default function AccountSelect() {
    return (
        <ThemedSafeArea>
            <YStack gap="$6" paddingHorizontal="$6">

                <YStack alignItems="center" marginTop="$12" gap="$2">
                    <Logo width={200} height={100} />
                    <H1 textAlign="center">Start je verhaal</H1>
                </YStack>
                <YStack gap="$6">
                    <YStack gap="$2">
                        <Button label="Login" onPress={() => router.push("/login")} />
                        <Button label="Account aanmaken" onPress={() => router.push("/onboarding/role")} />
                    </YStack>
                </YStack>
            </YStack>
        </ThemedSafeArea >
    );
}
