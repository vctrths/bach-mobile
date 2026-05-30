import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { H1, Spinner, Text, YStack } from "tamagui";
import Divider from "@/components/ui/Divider";

import Logo from "@/assets/images/logo.svg";

export default function AccountSelect() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOAuth = async (provider: "google" | "facebook") => {
        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            const redirectTo = Linking.createURL("auth/callback");

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: { redirectTo, skipBrowserRedirect: true },
            });

            if (error) {
                setError(error.message);
                return;
            }

            if (data?.url) {
                const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

                if (result.type === "success") {
                    router.replace("/auth/callback");
                }
            }
        } catch (oauthError) {
            setError(
                oauthError instanceof Error
                    ? oauthError.message
                    : "Kon inloggen niet starten",
            );
        } finally {
            setLoading(false);
        }
    };
    return (
        <ThemedSafeArea>
            <YStack gap="$6" paddingHorizontal="$6">

                <YStack alignItems="center" marginTop="$12" gap="$2">
                    <Logo width={200} height={100} />
                    <H1 textAlign="center">Start je verhaal</H1>
                </YStack>
                <YStack gap="$6">
                    <YStack gap="$2">
                        <Button label="Login" onPress={() => router.push("/login")} disabled={loading} />
                        <Button label="Account aanmaken" onPress={() => router.push("/onboarding/role")} disabled={loading} />
                    </YStack>
                    <Divider hasLabel />
                    <YStack gap="$2">
                        <Button
                            variant="secondary"
                            label="Ga door met Google"
                            icon={<Ionicons name="logo-google" size={20} />}
                            onPress={() => handleOAuth("google")}
                            disabled={loading}
                        />
                        <Button
                            variant="secondary"
                            label="Ga door met Facebook"
                            icon={<Ionicons name="logo-facebook" size={20} />}
                            onPress={() => handleOAuth("facebook")}
                            disabled={loading}
                        />
                    </YStack>
                    {error && (
                        <Text color="red" fontSize="$2" textAlign="center">
                            {error}
                        </Text>
                    )}
                    {loading && (
                        <YStack alignItems="center">
                            <Spinner size="small" color="$primary" />
                        </YStack>
                    )}
                </YStack>
            </YStack>
        </ThemedSafeArea >
    );
}
