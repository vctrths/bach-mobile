import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import ScreenContent from "@/components/ui/ScreenContent";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Alert } from "react-native";
import { Card, H1, Input, Text, XStack, YStack } from "tamagui";

export default function PaymentScreen() {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "").replace(/\D/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") ?? "";
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handlePayment = () => {
    if (!cardNumber.replace(/\s/g, "").match(/^\d{16}$/)) {
      Alert.alert("Fout", "Vul een geldig kaartnummer in (16 cijfers).");
      return;
    }
    if (!cardHolder.trim()) {
      Alert.alert("Fout", "Vul de naam van de kaarthouder in.");
      return;
    }
    if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
      Alert.alert("Fout", "Vul een geldige vervaldatum in (MM/JJ).");
      return;
    }
    if (!cvv.match(/^\d{3}$/)) {
      Alert.alert("Fout", "Vul een geldige CVV in (3 cijfers).");
      return;
    }

    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      router.push("/succesabo");
    }, 2000);
  };

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenContent>
          <TopNavPill
            title="Betaalgegevens"
            onBackPress={() => router.back()}
          />

          {/* Summary Card */}
          <Card
            elevation={2}
            backgroundColor="rgba(227, 236, 215, 0.5)"
            borderColor="rgba(227, 236, 215, 0.85)"
            borderWidth={1}
            borderRadius="$6"
            padding="$5"
            gap="$2"
          >
            <Text fontSize="$3" color="$secondary" fontWeight="500">
              Abonnement
            </Text>
            <XStack justifyContent="space-between" alignItems="center">
              <H1 color="$text_dark" fontWeight="bold" fontSize="$5">
                Groene Vingers Pro
              </H1>
              <Text fontSize="$5" color="$primary" fontWeight="bold">
                €7/maand
              </Text>
            </XStack>
            <Text fontSize="$3" color="$secondary">
              Elke maand opzegbaar. 7 dagen gratis proefperiode.
            </Text>
          </Card>

          {/* Payment Form */}
          <YStack gap="$4">
            <H1 color="$text_dark" fontWeight="bold" fontSize="$5">
              Kaartgegevens
            </H1>

            <YStack gap="$2">
              <Text color="$text_dark" fontSize="$3" fontWeight="500">
                Kaartnummer
              </Text>
              <XStack
                backgroundColor="white"
                borderRadius="$6"
                borderWidth={1}
                borderColor="rgba(23, 51, 0, 0.1)"
                paddingHorizontal="$4"
                paddingVertical="$3"
                alignItems="center"
                gap="$2"
              >
                <Ionicons name="card-outline" size={20} color="#57594D" />
                <Input
                  flex={1}
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="number-pad"
                  backgroundColor="transparent"
                  borderWidth={0}
                  padding={0}
                  fontSize="$4"
                  color="$text_dark"
                />
              </XStack>
            </YStack>

            <YStack gap="$2">
              <Text color="$text_dark" fontSize="$3" fontWeight="500">
                Naam kaarthouder
              </Text>
              <Input
                placeholder="J. Doe"
                value={cardHolder}
                onChangeText={setCardHolder}
                backgroundColor="white"
                borderColor="rgba(23, 51, 0, 0.1)"
                borderWidth={1}
                borderRadius="$6"
                paddingHorizontal="$4"
                paddingVertical="$3"
                fontSize="$4"
                color="$text_dark"
              />
            </YStack>

            <XStack gap="$3">
              <YStack flex={1} gap="$2">
                <Text color="$text_dark" fontSize="$3" fontWeight="500">
                  Vervaldatum
                </Text>
                <Input
                  placeholder="MM/JJ"
                  value={expiryDate}
                  onChangeText={(text) =>
                    setExpiryDate(formatExpiryDate(text))
                  }
                  keyboardType="number-pad"
                  maxLength={5}
                  backgroundColor="white"
                  borderColor="rgba(23, 51, 0, 0.1)"
                  borderWidth={1}
                  borderRadius="$6"
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  fontSize="$4"
                  color="$text_dark"
                />
              </YStack>
              <YStack flex={1} gap="$2">
                <Text color="$text_dark" fontSize="$3" fontWeight="500">
                  CVV
                </Text>
                <Input
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="number-pad"
                  maxLength={3}
                  secureTextEntry
                  backgroundColor="white"
                  borderColor="rgba(23, 51, 0, 0.1)"
                  borderWidth={1}
                  borderRadius="$6"
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  fontSize="$4"
                  color="$text_dark"
                />
              </YStack>
            </XStack>
          </YStack>

          {/* Security Note */}
          <XStack alignItems="center" gap="$2" marginTop="$2">
            <Ionicons name="shield-checkmark" size={18} color="#22c55e" />
            <Text fontSize="$2" color="$secondary">
              Je betaling is beveiligd met 256-bit encryptie.
            </Text>
          </XStack>

          {/* Submit Button */}
          <Button
            label={loading ? "Bezig met verwerken..." : "Start Pro-abonnement"}
            backgroundColor="$background"
            color="$white"
            onPress={handlePayment}
            disabled={loading}
            opacity={loading ? 0.7 : 1}
          />
        </ScreenContent>
      </ScrollView>
    </ThemedSafeArea>
  );
}
