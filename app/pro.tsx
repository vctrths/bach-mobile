import Button from "@/components/ui/Button";
import PageContainer from "@/components/ui/PageContainer";
import { useAlerts } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { Platform } from "react-native";
import { Text, YStack } from "tamagui";

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

interface PlanFeatureProps {
  children: React.ReactNode;
}

function PlanFeature({ children }: PlanFeatureProps) {
  return (
    <Text fontSize={16} color="#000000" fontFamily="$body">
      {children}
    </Text>
  );
}

interface PlanCardProps {
  title: string;
  features: React.ReactNode[];
  buttonLabel: string;
  buttonVariant?: "primary" | "secondary";
  disabled?: boolean;
  onButtonPress: () => void;
}

function PlanCard({
  title,
  features,
  buttonLabel,
  buttonVariant = "primary",
  disabled = false,
  onButtonPress,
}: PlanCardProps) {
  const isPrimary = buttonVariant === "primary";

  return (
    <YStack
      backgroundColor="#F0F3EC"
      borderColor="#EAF0D8"
      borderWidth={1}
      borderRadius={32}
      padding={12}
      paddingBottom={24}
      gap={16}
    >
      {/* Plan Header Badge */}
      <YStack alignItems="flex-start">
        <YStack
          backgroundColor="#FFFFFF"
          borderColor="#EAF0D8"
          borderWidth={1}
          borderRadius={500}
          paddingHorizontal={12}
          paddingVertical={8}
        >
          <Text
            fontSize={20}
            color="#000000"
            fontFamily="$body"
            fontWeight="900"
          >
            {title}
          </Text>
        </YStack>
      </YStack>

      {/* Features List */}
      <YStack gap={8}>
        {features.map((feature, index) => (
          <PlanFeature key={index}>{feature}</PlanFeature>
        ))}
      </YStack>

      {/* Action Button */}
      <YStack marginTop="auto">
        <Button
          label={buttonLabel}
          variant={isPrimary ? "primary" : "secondary"}
          onPress={onButtonPress}
          disabled={disabled}
        />
      </YStack>
    </YStack>
  );
}

export default function ProScreen() {
  const { user, profile } = useAuth();
  const { alert } = useAlerts();
  const [loading, setLoading] = useState(false);
  const isPremium = !!profile?.isPremium;

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
    <PageContainer
      topNavTitle="Abonnement"
      showBottomNav={false}
    >
      <YStack gap={10} paddingHorizontal={16} paddingTop={16}>
        {/* Pro Plan Card */}
        <PlanCard
          title="Pro plan"
          features={[
            "  - Tuinen bekijken & zoeken",
            "  - Matchen met tuin eigenaar",
            "  - Aanvragen versturen",
            "  - Logboek bijhouden",
            "",
            "€7 / Per maand",
          ]}
          buttonLabel={
            isPremium ? "Huidig plan" : loading ? "Stripe openen..." : "Registreer nu"
          }
          buttonVariant="primary"
          disabled={isPremium || loading}
          onButtonPress={openPaymentLink}
        />

        {/* Free Plan Card */}
        <PlanCard
          title="Gratis plan"
          features={["  - Tuinen bekijken & zoeken", ""]}
          buttonLabel="Huidig plan"
          buttonVariant="secondary"
          onButtonPress={() => {}}
        />
      </YStack>
    </PageContainer>
  );
}
