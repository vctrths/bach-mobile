import Button from "@/components/ui/Button";
import ProgressDots from "@/components/ui/ProgressDots";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Circle, H1, Image, YStack } from "tamagui";

export default function Photo() {
    const [image, setImage] = useState<string | null>(null);

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

    const handleNext = () => {
        // Handle final account creation here
        router.push("/");
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
                </YStack>

                <YStack gap="$4" marginBottom="$6">
                    <ProgressDots total={4} current={3} />
                    <Button
                        label="Account aanmaken"
                        backgroundColor="$background"
                        color="$white"
                        onPress={handleNext}
                    />
                </YStack>
            </YStack>
        </ThemedSafeArea>
    );
}
