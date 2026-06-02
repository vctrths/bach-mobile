import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { useState } from "react";
import { H1, Input, Text, YStack } from "tamagui";

function getLoginErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "E-mailadres of wachtwoord is onjuist.";
  }

  if (normalized.includes("missing email") || normalized.includes("email")) {
    return "Vul een geldig e-mailadres in.";
  }

  return "Inloggen is niet gelukt. Probeer het opnieuw.";
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Vul je e-mailadres en wachtwoord in.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      setError(getLoginErrorMessage(error.message));
      setLoading(false);
      return;
    }

    // Give auth state change a moment to propagate
    setTimeout(() => {
      router.replace("/splash");
    }, 0);
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
                placeholder="jij@example.com"
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
                placeholder="Je wachtwoord"
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

        </YStack>
      </YStack>
    </ThemedSafeArea>
  );
}
