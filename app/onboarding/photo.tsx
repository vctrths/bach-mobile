import Button from "@/components/ui/Button";
import ProgressDots from "@/components/ui/ProgressDots";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState, useContext } from "react";
import { Circle, H1, Image, YStack, Text } from "tamagui";
import { OnboardingContext } from "@/context/OnboardingContext";
import { supabase } from "@/utils/supabase";

export default function Photo() {
    const { data, reset } = useContext(OnboardingContext);
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Sorry, we hebben toegang tot je foto's nodig om een profielfoto te kunnen kiezen.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
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
                email: data.email,
                password: data.password,
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
                    const blob = await response.blob();
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from("profile-images")
                        .upload(fileName, blob, {
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
                    console.warn("Error reading or uploading the local file:", uploadFetchErr);
                }
            }


            // 3. Save user profile to Supabase
            const { error: profileError } = await supabase
                .from("profiles")
                .insert({
                    id: userId,
                    first_name: data.firstName,
                    last_name: data.lastName,
                    email: data.email,
                    description: data.description,
                    role: data.role,
                    profile_image: profileImageUrl,
                    created_at: new Date(),
                });

            if (profileError) {
                setError(profileError.message);
                setIsLoading(false);
                return;
            }

            // 4. Clear onboarding context and navigate to dashboard
            reset();
            router.replace("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
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

                    <YStack flex={1} justifyContent="center" alignItems="center" marginTop="$10">
                        <Circle
                            size={180}
                            backgroundColor="$borderColor"
                            onPress={pickImage}
                            pressStyle={{ scale: 0.98, opacity: 0.8 }}
                            overflow="hidden"
                        >
                            {image ? (
                                <Image
                                    source={{ uri: image }}
                                    width="100%"
                                    height="100%"
                                    objectFit="cover"
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
                        backgroundColor="$background"
                        color="$white"
                        onPress={handleNext}
                        disabled={isLoading}
                        opacity={isLoading ? 0.6 : 1}
                    />
                </YStack>
            </YStack>
        </ThemedSafeArea>
    );
}
