import Button from "@/components/ui/Button";
import PageContainer from "@/components/ui/PageContainer";
import { router } from "expo-router";
import React from "react";
import { Text, YStack } from "tamagui";

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
  onButtonPress: () => void;
}

function PlanCard({ title, features, buttonLabel, buttonVariant = "primary", onButtonPress }: PlanCardProps) {
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
        />
      </YStack>
    </YStack>
  );
}

export default function ProScreen() {
  return (
    <PageContainer
      topNavTitle="Abonnement"
      onBackPress={() => router.back()}
      showBottomNav={false}
    >
      <YStack gap={10} paddingHorizontal={16} paddingTop={16}>
        {/* Pro Plan Card */}
        <PlanCard
          title="Pro plan"
          features={[
            "  - Tuinen bekijken & zoeken",
            "  - Matchen met tuin eigenaar",
            "  - Logboek bijhouden",
            "",
            "€7 / Per maand",
          ]}
          buttonLabel="Registreer nu"
          buttonVariant="primary"
          onButtonPress={() => router.push("/pro/payment")}
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
