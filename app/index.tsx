import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { OnboardingContext } from "@/context/OnboardingContext";
import { supabase } from "@/utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { H1, H3, Text, XStack, YStack } from "tamagui";

/**
 * DEBUG GATE
 * This screen helps you choose between starting fresh with onboarding
 * or skipping straight to the dashboard.
 *
 * TODO: Remove this file and rename dashboard.tsx back to index.tsx
 * when development is complete.
 */
export default function DebugGate() {
  const { data, updateData, reset } = useContext(OnboardingContext);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user?.email || null);
    };
    checkUser();
    setRole(data.role || null);
  }, [data.role]);

  const startAsRole = async (selectedRole: "tuineigenaar" | "tuinzoeker") => {
    await updateData({ role: selectedRole });
    if (selectedRole === "tuineigenaar") {
      router.push("/owner/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    reset();
    setCurrentUser(null);
    setRole(null);
    Alert.alert("Logged out", "You have been signed out.");
  };

  const handleResetOnboarding = async () => {
    reset();
    setRole(null);
    Alert.alert("Reset", "Onboarding data cleared.");
  };

  const handleClearStorage = async () => {
    await AsyncStorage.clear();
    await supabase.auth.signOut();
    setCurrentUser(null);
    setRole(null);
    Alert.alert("Cleared", "All local storage cleared + logged out.");
  };

  return (
    <ThemedSafeArea>
      <YStack flex={1} padding="$6" gap="$4">
        <YStack alignItems="center" gap="$2">
          <H1 textAlign="center" color="$primary" fontWeight="bold">
            Debug Mode
          </H1>
          <Text textAlign="center" color="$text_dark">
            Quick access for testing:
          </Text>
        </YStack>

        {/* Current user info */}
        <YStack
          backgroundColor="rgba(23, 51, 0, 0.05)"
          padding="$3"
          borderRadius="$4"
          gap="$1"
        >
          <Text fontSize="$2" color="$secondary">
            Current user: {currentUser || "Not logged in"}
          </Text>
          <Text fontSize="$2" color="$secondary">
            Role: {role || "None"}
          </Text>
        </YStack>

        {/* Main entry points */}
        <H3 fontSize="$5" color="$text_dark" fontWeight="bold">
          Entry Points
        </H3>
        <Button
          label="Start Onboarding Flow"
          size="$5"
          backgroundColor="$primary"
          onPress={() => router.push("/onboarding")}
        />

        <XStack gap="$3">
          <Button
            label="Tuineigenaar"
            flex={1}
            size="$5"
            backgroundColor="$primary"
            onPress={() => startAsRole("tuineigenaar")}
          />
          <Button
            label="Tuinzoeker"
            flex={1}
            size="$5"
            backgroundColor="$accent"
            onPress={() => startAsRole("tuinzoeker")}
          />
        </XStack>

        <Button
          label="Skip to Dashboard (no role)"
          size="$5"
          backgroundColor="transparent"
          borderWidth={1}
          borderColor="$primary"
          onPress={() => router.push("/dashboard")}
          color="$primary"
        />

        <Button
          label="Login / Sign Up"
          size="$5"
          backgroundColor="$accent"
          onPress={() => router.push("/login")}
        />

        {/* Quick shortcuts */}
        <H3 fontSize="$5" color="$text_dark" fontWeight="bold" marginTop="$2">
          Shortcuts
        </H3>
        <XStack gap="$3">
          <Button
            label="Notifications"
            flex={1}
            size="$4"
            backgroundColor="rgba(23, 51, 0, 0.08)"
            color="#173300"
            onPress={() => router.push("/notifications")}
          />
          <Button
            label="Messages"
            flex={1}
            size="$4"
            backgroundColor="rgba(23, 51, 0, 0.08)"
            color="#173300"
            onPress={() => router.push("/messages")}
          />
        </XStack>
        <XStack gap="$3">
          <Button
            label="Create Garden"
            flex={1}
            size="$4"
            backgroundColor="rgba(23, 51, 0, 0.08)"
            color="#173300"
            onPress={() => router.push("/garden/create")}
          />
          <Button
            label="Profile"
            flex={1}
            size="$4"
            backgroundColor="rgba(23, 51, 0, 0.08)"
            color="#173300"
            onPress={() => router.push("/profile")}
          />
        </XStack>
        <XStack gap="$3">
          <Button
            label="Settings"
            flex={1}
            size="$4"
            backgroundColor="rgba(23, 51, 0, 0.08)"
            color="#173300"
            onPress={() => router.push("/settings")}
          />
          <Button
            label="Search"
            flex={1}
            size="$4"
            backgroundColor="rgba(23, 51, 0, 0.08)"
            color="#173300"
            onPress={() => router.push("/search")}
          />
        </XStack>

        {/* Debug actions */}
        <H3 fontSize="$5" color="$text_dark" fontWeight="bold" marginTop="$2">
          Debug Actions
        </H3>
        <Button
          label="Logout"
          size="$4"
          backgroundColor="#ef4444"
          onPress={handleLogout}
        />
        <Button
          label="Reset Onboarding Data"
          size="$4"
          backgroundColor="transparent"
          borderWidth={1}
          borderColor="#ef4444"
          color="#ef4444"
          onPress={handleResetOnboarding}
        />
        <Button
          label="Clear All Local Storage + Logout"
          size="$4"
          backgroundColor="transparent"
          borderWidth={1}
          borderColor="#ef4444"
          color="#ef4444"
          onPress={handleClearStorage}
        />

        <YStack
          marginTop="$6"
          padding="$4"
          backgroundColor="rgba(23, 51, 0, 0.05)"
          borderRadius="$4"
          gap="$2"
        >
          <Text fontSize="$2" color="$text_dark" textAlign="center">
            Note: This screen is temporary for debugging.
          </Text>
          <Text fontSize="$2" color="$secondary" textAlign="center">
            Use this to quickly navigate and test features during development.
          </Text>
        </YStack>
      </YStack>
    </ThemedSafeArea>
  );
}
