import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { router } from "expo-router";
import { useState } from "react";
import { H1, styled, Text, XStack, YStack } from "tamagui";
import Divider from "@/components/ui/Divider";
import ProgressDots from "@/components/ui/ProgressDots";

const RoleCard = styled(YStack, {
    backgroundColor: "$white",
    padding: "$8",
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    pressStyle: {
        scale: 0.98,
        opacity: 0.8,
    },
});



export default function RoleSelection() {
    const [selectedRole, setSelectedRole] = useState<"tuineigenaar" | "tuinzoeker" | null>(null);

    const handleNext = () => {
        if (selectedRole) {
            router.push("/onboarding/info");
        }
    };

    return (
        <ThemedSafeArea>
            <YStack flex={1} paddingHorizontal="$6" justifyContent="space-between">

                <YStack marginTop="$12" gap="$10">
                    <H1 textAlign="center" color="$primary" fontWeight="bold">
                        Ben je een...
                    </H1>

                    <YStack gap="$4">
                        <RoleCard
                            backgroundColor={selectedRole === "tuineigenaar" ? "$background" : "$white"}
                            borderColor={selectedRole === "tuineigenaar" ? "$background" : "$borderColor"}
                            onPress={() => setSelectedRole("tuineigenaar")}
                        >
                            <Text
                                color={selectedRole === "tuineigenaar" ? "$white" : "$text_dark"}
                                fontSize="$5"
                            >
                                Tuineigenaar
                            </Text>
                        </RoleCard>

                        <Divider hasLabel />

                        <RoleCard
                            backgroundColor={selectedRole === "tuinzoeker" ? "$background" : "$white"}
                            borderColor={selectedRole === "tuinzoeker" ? "$background" : "$borderColor"}
                            onPress={() => setSelectedRole("tuinzoeker")}
                        >
                            <Text
                                color={selectedRole === "tuinzoeker" ? "$white" : "$text_dark"}
                                fontSize="$5"
                            >
                                Tuinzoeker
                            </Text>
                        </RoleCard>
                    </YStack>
                </YStack>

                <YStack gap="$4" marginBottom="$6">
                    <ProgressDots total={4} current={0} />
                    <Button
                        label="Volgende stap"
                        backgroundColor="$background"
                        color="$white"
                        onPress={handleNext}
                        opacity={selectedRole ? 1 : 0.5}
                        disabled={!selectedRole}
                    />
                </YStack>
            </YStack>
        </ThemedSafeArea >
    );
}
