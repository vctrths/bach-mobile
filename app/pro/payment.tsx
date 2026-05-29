import PageContainer from "@/components/ui/PageContainer";
import Button from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { ScrollView, Alert, Platform } from "react-native";
import { Card, H1, Text, XStack, YStack } from "tamagui";
// eslint-disable-next-line import/no-unresolved
import { useStripe as useNativeStripe } from "@/lib/stripe";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

function NativePaymentFlow({
  fetchPaymentSheetParams,
  loading,
  setLoading,
}: {
  fetchPaymentSheetParams: () => Promise<any>;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const { initPaymentSheet, presentPaymentSheet } = useNativeStripe();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams();

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Groen",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
      });

      if (initError) throw new Error(initError.message);

      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code === "Canceled") return;
        Alert.alert(`Fout: ${error.code}`, error.message);
      } else {
        router.push("/succesabo");
      }
    } catch (e: any) {
      Alert.alert("Fout", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      label={loading ? "Laden..." : "Betaal nu met Stripe"}
      onPress={handlePayment}
      disabled={loading}
      marginTop="$4"
    />
  );
}

function WebPaymentFlow({
  fetchPaymentSheetParams,
}: {
  fetchPaymentSheetParams: () => Promise<any>;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentSheetParams()
      .then((data) => {
        setClientSecret(data.paymentIntent);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <YStack alignItems="center" padding="$6">
        <Text color="$secondary">Betaalformulier laden...</Text>
      </YStack>
    );
  }

  if (error || !clientSecret) {
    return (
      <YStack gap="$3">
        <Text color="$error">{error || "Kon betaalgegevens niet ophalen"}</Text>
        <Button label="Opnieuw proberen" onPress={() => window.location.reload()} />
      </YStack>
    );
  }

  return <WebPaymentForm clientSecret={clientSecret} />;
}

function WebPaymentForm({ clientSecret }: { clientSecret: string }) {
  const [stripePromise] = useState(() =>
    loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "")
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async () => {
      if (!stripe || !elements) return;
      setSubmitting(true);
      setError(null);

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/succesabo`,
        },
      });

      if (error) {
        setError(error.message ?? "Betaling mislukt");
        setSubmitting(false);
      }
    };

    return (
      <YStack gap="$4">
        <div style={{ marginTop: 16 }}>
          <PaymentElement />
        </div>
        {error && <Text color="$error">{error}</Text>}
        <Button
          label={submitting ? "Verwerken..." : "Betaal nu"}
          onPress={handleSubmit}
          disabled={submitting || !stripe}
        />
      </YStack>
    );
  };

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  );
}

export default function PaymentScreen() {
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

            {Platform.OS === "web" ? (
              <WebPaymentFlow fetchPaymentSheetParams={fetchPaymentSheetParams} />
            ) : (
              <NativePaymentFlow
                fetchPaymentSheetParams={fetchPaymentSheetParams}
                loading={loading}
                setLoading={setLoading}
              />
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </PageContainer>
  );
}
