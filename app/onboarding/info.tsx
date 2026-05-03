import Button from "@/components/ui/Button";
import ProgressDots from "@/components/ui/ProgressDots";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { router } from "expo-router";
import { useState, useContext } from "react";
import { H1, Input, Text, TextArea, XStack, YStack } from "tamagui";
import { z } from "zod";
import { OnboardingContext } from "@/context/OnboardingContext";

const infoSchema = z.object({
    firstName: z.string().min(1, { message: "error" }),
    lastName: z.string().min(1, { message: "error" }),
    email: z.string().email({ message: "Dit e-mailadres is ongeldig" }),
    description: z.string().min(1, { message: "Vul een beschrijving in" }) // Default message for empty
        .refine((val) => !val.includes("ongepast"), { message: "Je beschrijving bevat ongepaste woorden" }) // Just a simple mock for the figma error
});

export default function InfoSelection() {
    const { data, updateData } = useContext(OnboardingContext);
    const [firstName, setFirstName] = useState(data.firstName);
    const [lastName, setLastName] = useState(data.lastName);
    const [email, setEmail] = useState(data.email);
    const [description, setDescription] = useState(data.description);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleNext = () => {
        const result = infoSchema.safeParse({ firstName, lastName, email, description });
        if (result.success) {
            setErrors({});
            updateData({ firstName, lastName, email, description });
            router.push("/onboarding/security");
        } else {
            const formattedErrors: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                formattedErrors[issue.path[0] as string] = issue.message;
            });
            setErrors(formattedErrors);
        }
    };

    const isComplete = firstName && lastName && email && description;

    return (
        <ThemedSafeArea>
            <YStack flex={1} paddingHorizontal="$6" justifyContent="space-between">

                <YStack marginTop="$12" gap="$8">
                    <H1 textAlign="center" color="$primary" fontWeight="bold">
                        Vertel ons wat over jezelf!
                    </H1>

                    <YStack gap="$4">
                        <XStack gap="$4">
                            <YStack flex={1} gap="$2">
                                <Text color={errors.firstName ? "$error" : "$text_dark"} fontSize="$3" fontWeight="500">Voornaam</Text>
                                <Input
                                    placeholder="John"
                                    value={firstName}
                                    onChangeText={(val) => { setFirstName(val); setErrors((e) => ({ ...e, firstName: "" })); }}
                                    backgroundColor="$canvas"
                                    borderColor={errors.firstName ? "$error" : "$borderColor"}
                                    focusStyle={{ borderColor: errors.firstName ? "$error" : "$background" }}
                                />
                                {errors.firstName && <Text color="$error" fontSize="$2">{errors.firstName}</Text>}
                            </YStack>
                            <YStack flex={1} gap="$2">
                                <Text color={errors.lastName ? "$error" : "$text_dark"} fontSize="$3" fontWeight="500">Achternaam</Text>
                                <Input
                                    placeholder="Doe"
                                    value={lastName}
                                    onChangeText={(val) => { setLastName(val); setErrors((e) => ({ ...e, lastName: "" })); }}
                                    backgroundColor="$canvas"
                                    borderColor={errors.lastName ? "$error" : "$borderColor"}
                                    focusStyle={{ borderColor: errors.lastName ? "$error" : "$background" }}
                                />
                                {errors.lastName && <Text color="$error" fontSize="$2">{errors.lastName}</Text>}
                            </YStack>
                        </XStack>

                        <YStack gap="$2">
                            <Text color={errors.email ? "$error" : "$text_dark"} fontSize="$3" fontWeight="500">E-mailadres</Text>
                            <Input
                                placeholder="johndoe@mail.com"
                                value={email}
                                onChangeText={(val) => { setEmail(val); setErrors((e) => ({ ...e, email: "" })); }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                backgroundColor="$canvas"
                                borderColor={errors.email ? "$error" : "$borderColor"}
                                focusStyle={{ borderColor: errors.email ? "$error" : "$background" }}
                            />
                            {errors.email && <Text color="$error" fontSize="$2">{errors.email}</Text>}
                        </YStack>

                        <YStack gap="$2">
                            <Text color={errors.description ? "$error" : "$text_dark"} fontSize="$3" fontWeight="500">Beschrijving</Text>
                            <TextArea
                                placeholder="Vertel wat over jezelf"
                                value={description}
                                onChangeText={(val) => { setDescription(val); setErrors((e) => ({ ...e, description: "" })); }}
                                minHeight={100}
                                backgroundColor="$canvas"
                                borderColor={errors.description ? "$error" : "$borderColor"}
                                focusStyle={{ borderColor: errors.description ? "$error" : "$background" }}
                            />
                            {errors.description && <Text color="$error" fontSize="$2">{errors.description}</Text>}
                        </YStack>
                    </YStack>
                </YStack>

                <YStack gap="$4" marginBottom="$6">
                    <ProgressDots total={4} current={1} />
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
