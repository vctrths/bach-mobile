import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { H1, YStack } from "tamagui";
import Divider from "@/components/ui/Divider";

import Logo from "@/assets/images/logo.svg";

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

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
                    <Divider hasLabel />
                    <YStack gap="$2">
                        <Button
                            backgroundColor="$background_secondary"
                            color="$text_dark"
                            label="Ga door met Google"
                            icon={<Ionicons name="logo-google" size={20} />}
                        />
                        <Button
                            backgroundColor="$background_secondary"
                            color="$text_dark"
                            label="Ga door met Facebook"
                            icon={<Ionicons name="logo-facebook" size={20} />}
                        />
                    </YStack>
                </YStack>
            </YStack>
        </ThemedSafeArea >
    );
}