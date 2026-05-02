import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { H1, Input, Text, YStack } from "tamagui";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        // Handle login logic here
        router.push("/"); // Navigate home or dashboard upon success
    };

    return (
        <ThemedSafeArea>
            <YStack flex={1} paddingHorizontal="$6" justifyContent="center">
                <YStack gap="$8">
                    <H1 textAlign="center" color="$primary" fontWeight="bold" marginTop="$8">
                        Login
                    </H1>

                    <YStack gap="$4">
                        <YStack gap="$2">
                            <Text color="$text_dark" fontSize="$3" fontWeight="500">Email</Text>
                            <Input
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                backgroundColor="$canvas"
                                borderColor="$borderColor"
                                focusStyle={{ borderColor: "$background" }}
                            />
                        </YStack>

                        <YStack gap="$2">
                            <Text color="$text_dark" fontSize="$3" fontWeight="500">Wachtwoord</Text>
                            <Input
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                backgroundColor="$canvas"
                                borderColor="$borderColor"
                                focusStyle={{ borderColor: "$background" }}
                            />
                        </YStack>

                        <YStack marginTop="$4">
                            <Button
                                label="Login"
                                backgroundColor="$background"
                                color="$white"
                                onPress={handleLogin}
                            />
                        </YStack>
                    </YStack>

                    <Divider hasLabel label="of" />

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
        </ThemedSafeArea>
    );
}
