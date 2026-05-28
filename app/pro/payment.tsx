import PageContainer from "@/components/ui/PageContainer";
import Button from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Alert, Platform } from "react-native";
import { Card, H1, Text, XStack, YStack } from "tamagui";
import { useStripe } from "@stripe/stripe-react-native";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";

export default function PaymentScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchPaymentSheetParams = async () => {
    const { data, error } = await supabase.functions.invoke("stripe-payment-sheet", {
      body: { user_id: user?.id },
    });

    if (error) {
      console.error("Error fetching payment sheet params:", error);
      throw new Error("Kon betaalgegevens niet ophalen");
    }

    return data;
  };

  const initializePaymentSheet = async () => {
    setLoading(true);
    try {
      const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams();

      const { error } = await initPaymentSheet({
        merchantDisplayName: "Groen",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: user?.user_metadata?.first_name + " " + user?.user_metadata?.last_name,
        },
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (e: any) {
      if (Platform.OS === "web") window.alert(e.message);
      else Alert.alert("Fout", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    await initializePaymentSheet();
    
    const { error } = await presentPaymentSheet();

    if (error) {
      if (error.code === "Canceled") return;
      if (Platform.OS === "web") window.alert(error.message);
      else Alert.alert(`Fout: ${error.code}`, error.message);
    } else {
      router.push("/succesabo");
    }
  };

  return (
    <PageContainer topNavTitle="Betaalgegevens" onBackPress={() => router.back()}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$6" paddingHorizontal="$4">
          <Card
            elevation={2}
            backgroundColor="rgba(227, 236, 215, 0.5)"
            borderColor="rgba(227, 236, 215, 0.85)"
            borderWidth={1}
            borderRadius="$6"
            padding="$5"
            gap="$3"
          >
            <Text fontSize="$4" color="$secondary" fontWeight="500">
              Abonnement
            </Text>
            <XStack justifyContent="space-between" alignItems="center">
              <H1 color="$text_dark" fontWeight="bold" fontSize="$6">
                Groene Vingers Pro
              </H1>
              <Text fontSize="$6" color="$primary" fontWeight="bold">
                €7/maand
              </Text>
            </XStack>
            <Text fontSize="$4" color="$secondary">
              Elke maand opzegbaar. 7 dagen gratis proefperiode.
            </Text>
          </Card>

          <YStack gap="$4" marginTop="$6">
            <H1 color="$text_dark" fontWeight="bold" fontSize="$6">
              Veilig betalen met Stripe
            </H1>
            <Text color="$text_dark" fontSize="$4">
              We gebruiken Stripe om je betaling veilig te verwerken. Je kunt betalen met creditcard,
              Apple Pay of Google Pay.
            </Text>

            <XStack alignItems="center" gap="$2" marginTop="$2">
              <Ionicons name="shield-checkmark" size={18} color="#22c55e" />
              <Text fontSize="$3" color="$secondary">
                Je betaling is beveiligd met 256-bit encryptie.
              </Text>
            </XStack>

            <Button
              label={loading ? "Laden..." : "Betaal nu met Stripe"}
              onPress={handlePayment}
              disabled={loading}
              marginTop="$4"
            />
          </YStack>
        </YStack>
      </ScrollView>
    </PageContainer>
  );
}
