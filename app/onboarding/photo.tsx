import Button from "@/components/ui/Button";
import ProgressDots from "@/components/ui/ProgressDots";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { OnboardingContext } from "@/context/OnboardingContext";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image as ExpoImage } from "@/lib/image";
import { router } from "expo-router";
import { useContext, useState } from "react";
import { Platform } from "react-native";
import { Circle, H1, Text, YStack } from "tamagui";

export default function Photo() {
  const { data: onboardingData, reset } = useContext(OnboardingContext);
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert(
          "Sorry, we hebben toegang tot je foto's nodig om een profielfoto te kunnen kiezen.",
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      ...(Platform.OS !== "web" && {
        allowsEditing: true,
        aspect: [1, 1] as [number, number],
      }),
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleNext = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: onboardingData.email,
        password: onboardingData.password,
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Failed to create user account");
        setIsLoading(false);
        return;
      }

      const userId = authData.user.id;
      let profileImageUrl = null;

      // 2. Upload profile image if provided
      if (image) {
        const fileName = `${userId}_profile_${Date.now()}.jpg`;
        try {
          const response = await fetch(image);
          const arrayBuffer = await response.arrayBuffer();
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("profile-images")
              .upload(fileName, arrayBuffer, {
                contentType: "image/jpeg",
                upsert: true,
              });

          if (uploadError) {
            console.warn("Failed to upload profile image:", uploadError);
          } else if (uploadData) {
            const { data: urlData } = supabase.storage
              .from("profile-images")
              .getPublicUrl(fileName);
            profileImageUrl = urlData?.publicUrl;
          }
        } catch (uploadFetchErr) {
          console.warn(
            "Error reading or uploading the local file:",
            uploadFetchErr,
          );
        }
      }

      // 3. Save user profile to Supabase
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        first_name: onboardingData.firstName,
        last_name: onboardingData.lastName,
        email: onboardingData.email,
        description: onboardingData.description,
        role: onboardingData.role || "tuinzoeker",
        profile_image: profileImageUrl,
      });

      if (profileError) {
        setError(profileError.message);
        setIsLoading(false);
        return;
      }

      // 4. Clear onboarding context and navigate to dashboard
      reset();
      setTimeout(() => {
        router.replace("/");
      }, 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setIsLoading(false);
    }
  };

  return (
    <ThemedSafeArea>
      <YStack flex={1} paddingHorizontal="$6" justifyContent="space-between">
        <YStack marginTop="$12" gap="$8" alignItems="center">
          <H1 textAlign="center" color="$primary" fontWeight="bold">
            Stel je profielfoto in
          </H1>

          <YStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            marginTop="$10"
          >
            <Circle
              size={180}
              backgroundColor="$borderColor"
              onPress={pickImage}
              pressStyle={{ scale: 0.98, opacity: 0.8 }}
              overflow="hidden"
            >
              {image ? (
                <ExpoImage
                  source={{ uri: image }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="camera" size={60} color="#37392B" />
              )}
            </Circle>
          </YStack>

          {error && (
            <Text color="$error" textAlign="center" fontSize="$2">
              {error}
            </Text>
          )}
        </YStack>

        <YStack gap="$4" marginBottom="$6">
          <ProgressDots total={4} current={3} />
          <Button
            label={isLoading ? "Bezig met aanmaken..." : "Account aanmaken"}
            onPress={handleNext}
            disabled={isLoading}
          />
        </YStack>
      </YStack>
    </ThemedSafeArea>
  );
}
