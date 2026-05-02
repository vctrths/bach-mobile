import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import ProgressDots from "@/components/ui/ProgressDots";
import { router } from "expo-router";
import { useState } from "react";
import { H1, Input, Text, YStack } from "tamagui";
import { z } from "zod";

const securitySchema = z.object({
    password: z.string()
        .min(8, { message: "error" })
        .regex(/[^a-zA-Z0-9]/, { message: "error" }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Je wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
});

export default function Security() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleNext = () => {
        const result = securitySchema.safeParse({ password, confirmPassword });
        if (result.success) {
            setErrors({});
            router.push("/onboarding/photo");
        } else {
            const formattedErrors: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                formattedErrors[issue.path[0] as string] = issue.message;
            });
            setErrors(formattedErrors);
        }
    };

    const isComplete = password.length > 0 && confirmPassword.length > 0;

    return (
        <ThemedSafeArea>
            <YStack flex={1} paddingHorizontal="$6" justifyContent="space-between">

                <YStack marginTop="$12" gap="$8">
                    <H1 textAlign="center" color="$primary" fontWeight="bold">
                        Beveilig account
                    </H1>

                    <YStack gap="$6">
                        <YStack gap="$2">
                            <Text color={errors.password ? "$error" : "$text_dark"} fontSize="$3" fontWeight="500">Wachtwoord</Text>
                            <Input
                                placeholder="********"
                                value={password}
                                onChangeText={(val) => { setPassword(val); setErrors((e) => ({ ...e, password: "" })); }}
                                secureTextEntry
                                backgroundColor="$canvas"
                                borderColor={errors.password ? "$error" : "$borderColor"}
                                focusStyle={{ borderColor: errors.password ? "$error" : "$background" }}
                            />
                            {errors.password && <Text color="$error" fontSize="$2">{errors.password}</Text>}
                            <YStack marginTop="$1">
                                <Text color="$text_dark" fontSize="$3">je wachtwoord moet minimaal:</Text>
                                <Text color="$text_dark" fontSize="$3" marginLeft="$2">• 8 tekens lang zijn</Text>
                                <Text color="$text_dark" fontSize="$3" marginLeft="$2">• 1 speciaal teken bevatten</Text>
                            </YStack>
                        </YStack>

                        <YStack gap="$2">
                            <Text color={errors.confirmPassword ? "$error" : "$text_dark"} fontSize="$3" fontWeight="500">Bevestig wachtwoord</Text>
                            <Input
                                placeholder="********"
                                value={confirmPassword}
                                onChangeText={(val) => { setConfirmPassword(val); setErrors((e) => ({ ...e, confirmPassword: "" })); }}
                                secureTextEntry
                                backgroundColor="$canvas"
                                borderColor={errors.confirmPassword ? "$error" : "$borderColor"}
                                focusStyle={{ borderColor: errors.confirmPassword ? "$error" : "$background" }}
                            />
                            {errors.confirmPassword && <Text color="$error" fontSize="$2">{errors.confirmPassword}</Text>}
                        </YStack>
                    </YStack>
                </YStack>

                <YStack gap="$4" marginBottom="$6">
                    <ProgressDots total={4} current={2} />
                    <Button
                        label="Volgende stap"
                        backgroundColor="$background"
                        color="$white"
                        onPress={handleNext}
                        opacity={isComplete ? 1 : 0.5}
                        disabled={!isComplete}
                    />
                </YStack>
            </YStack>
        </ThemedSafeArea>
    );
}
