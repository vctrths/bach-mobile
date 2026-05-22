import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { supabase } from "@/utils/supabase";
import { getHomeRoute } from "@/utils/role-routing";
import { router } from "expo-router";
import { useEffect } from "react";
import { Spinner, Text, YStack } from "tamagui";

export default function AuthCallbackScreen() {
  useEffect(() => {
    const handleOAuthSession = async () => {
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
        router.replace(getHomeRoute(existingProfile.role) as any);
      } else {
        const { error } = await supabase.from("profiles").insert({
          id: session.user.id,
          email: session.user.email,
          first_name: session.user.user_metadata?.full_name?.split(" ")[0] || "",
          last_name: session.user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "",
          profile_image: session.user.user_metadata?.avatar_url || null,
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
