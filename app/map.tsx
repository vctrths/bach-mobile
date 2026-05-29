import TopNavPill from "@/components/ui/TopNavPill";
import { Ionicons } from "@expo/vector-icons";
import { Text, YStack } from "tamagui";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MapScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <YStack
        style={StyleSheet.absoluteFillObject}
        justifyContent="center"
        alignItems="center"
        gap="$4"
        paddingHorizontal="$4"
        backgroundColor="$white"
      >
        <Ionicons name="map-outline" size={64} color="#57594D" />
        <Text fontSize="$5" fontWeight="bold" color="$text_dark" textAlign="center">
          Kaartweergave
        </Text>
        <Text fontSize="$4" color="$secondary" textAlign="center" maxWidth={280}>
          De kaart is beschikbaar in de mobiele app. Open de app op je telefoon om tuinen in de buurt te ontdekken.
        </Text>
      </YStack>

      <TopNavPill title="Kaart" />
    </View>
  );
}
