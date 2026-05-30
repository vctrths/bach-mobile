import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Platform } from "react-native";
import { H1, Input, Text, YStack } from "tamagui";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Give auth state change a moment to propagate
    setTimeout(() => {
      router.replace("/splash");
    }, 0);
  };

  const handleOAuth = async (provider: "google" | "facebook") => {
    setLoading(true);
    setError(null);

    const redirectTo =
      Platform.OS === "web" && typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : Linking.createURL("auth/callback");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      if (result.type === "success") {
        router.replace("/auth/callback");
      }
    }

    setLoading(false);
  };

  return (
    <ThemedSafeArea>
      <YStack flex={1} paddingHorizontal="$6" justifyContent="center">
        <YStack gap="$8">
          <H1
            textAlign="center"
            color="$primary"
            fontWeight="bold"
            marginTop="$8"
          >
            Login
          </H1>

          <YStack gap="$4">
            <YStack gap="$2">
              <Text color="$text_dark" fontSize="$3" fontWeight="500">
                Email
              </Text>
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
              <Text color="$text_dark" fontSize="$3" fontWeight="500">
                Wachtwoord
              </Text>
              <Input
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                type="password"
                backgroundColor="$canvas"
                borderColor="$borderColor"
                focusStyle={{ borderColor: "$background" }}
              />
            </YStack>

            <YStack marginTop="$4">
              {error && (
                <Text
                  color="red"
                  fontSize="$2"
                  textAlign="center"
                  marginBottom="$2"
                >
                  {error}
                </Text>
              )}
              <Button
                label={loading ? "Bezig met inloggen..." : "Login"}
                onPress={handleLogin}
                disabled={loading}
              />
            </YStack>
          </YStack>

          <Divider hasLabel label="of" />

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
        </YStack>
      </YStack>
    </ThemedSafeArea>
  );
}
