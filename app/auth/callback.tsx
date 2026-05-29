import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { Spinner, Text, YStack } from "tamagui";

async function recoverWebSessionFromUrl() {
  if (Platform.OS !== "web" || typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  } else if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  if (code || accessToken) {
    window.history.replaceState(null, "", "/auth/callback");
  }
}

export default function AuthCallbackScreen() {
  useEffect(() => {
    const handleOAuthSession = async () => {
      await recoverWebSessionFromUrl();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", session.user.id)
        .single();

      if (existingProfile) {
        router.replace("/");
      } else {
        const { error } = await supabase.from("profiles").insert({
          id: session.user.id,
          email: session.user.email || "",
          first_name: session.user.user_metadata?.full_name?.split(" ")[0] || "",
          last_name: session.user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "",
          profile_image: session.user.user_metadata?.avatar_url || null,
          role: "gardener", // Default role for OAuth users, can be changed in onboarding
        });

        if (error) {
          router.replace("/login");
        } else {
          router.replace("/onboarding/role");
        }
      }
    };

    handleOAuthSession();
  }, []);

  return (
    <ThemedSafeArea>
      <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
        <Spinner size="large" color="$primary" />
        <Text color="$secondary" fontSize="$4">
          Authenticatie voltooien...
        </Text>
      </YStack>
    </ThemedSafeArea>
  );
}
