import Button from "@/components/ui/Button";
import PageContainer from "@/components/ui/PageContainer";
import { useAlerts } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { Platform, ScrollView } from "react-native";
import { Card, H1, Text, XStack, YStack } from "tamagui";

const PAYMENT_LINK_URL = process.env.EXPO_PUBLIC_STRIPE_PAYMENT_LINK_URL;

function buildPaymentLink(userId: string, email?: string | null) {
  if (!PAYMENT_LINK_URL) {
    throw new Error("Stripe Payment Link ontbreekt in de configuratie.");
  }

  const url = new URL(PAYMENT_LINK_URL);
  url.searchParams.set("client_reference_id", userId);
  if (email) {
    url.searchParams.set("locked_prefilled_email", email);
  }
  url.searchParams.set("locale", "nl");

  return url.toString();
}

export default function PaymentScreen() {
  const { user, profile } = useAuth();
  const { alert } = useAlerts();
  const [loading, setLoading] = useState(false);

  const openPaymentLink = async () => {
    if (!user) {
      alert("Fout", "Log eerst in om Pro te activeren.");
      return;
    }

    setLoading(true);
    try {
      const paymentLink = buildPaymentLink(user.id, profile?.email ?? user.email);

      if (Platform.OS === "web") {
        window.location.assign(paymentLink);
        return;
      }

      await WebBrowser.openBrowserAsync(paymentLink);
    } catch (error) {
      alert(
        "Fout",
        error instanceof Error
          ? error.message
          : "Kon Stripe niet openen. Probeer het opnieuw.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer topNavTitle="Betaalgegevens">
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
                EUR 7/maand
              </Text>
            </XStack>
            <Text fontSize="$4" color="$secondary">
              Elke maand opzegbaar. Je betaling wordt veilig verwerkt door
              Stripe.
            </Text>
          </Card>

          <YStack gap="$4" marginTop="$6">
            <H1 color="$text_dark" fontWeight="bold" fontSize="$6">
              Veilig betalen met Stripe
            </H1>
            <Text color="$text_dark" fontSize="$4">
              Na betaling zet Stripe automatisch je Pro-status aan via onze
              Supabase webhook.
            </Text>

            <XStack alignItems="center" gap="$2" marginTop="$2">
              <Ionicons name="shield-checkmark" size={18} color="#22c55e" />
              <Text fontSize="$3" color="$secondary">
                Je betaalgegevens worden niet opgeslagen in de app.
              </Text>
            </XStack>

            <Button
              label={loading ? "Stripe openen..." : "Betaal nu met Stripe"}
              onPress={openPaymentLink}
              disabled={loading}
              marginTop="$4"
            />
          </YStack>
        </YStack>
      </ScrollView>
    </PageContainer>
  );
}
