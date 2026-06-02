import Button from "@/components/ui/Button";
import PageContainer from "@/components/ui/PageContainer";
import { supabase } from "@/utils/supabase";
import { OnboardingContext } from "@/context/OnboardingContext";
import { router } from "expo-router";
import { safeBack } from "@/utils/navigation";
import React, { useContext, useEffect, useState } from "react";
import { Input, Spinner, Text, TextArea, XStack, YStack } from "tamagui";
import { useAlerts } from "@/context/AlertContext";

export default function PersonalDetailsScreen() {
  const { data, updateData } = useContext(OnboardingContext);
  const { alert } = useAlerts();

  const [firstName, setFirstName] = useState(data.firstName || "");
  const [lastName, setLastName] = useState(data.lastName || "");
  const [email, setEmail] = useState(data.email || "");
  const [description, setDescription] = useState(data.description || "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, email, description")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name ?? "");
        setLastName(profile.last_name ?? "");
        setEmail(profile.email ?? "");
        setDescription(profile.description ?? "");
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert("Fout", "Vul je voornaam en achternaam in.");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Fout", "Log eerst in om wijzigingen op te slaan");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          description: description.trim(),
        })
        .eq("id", user.id);

      if (error) {
        alert("Fout", error.message);
        return;
      }

      updateData({ firstName, lastName, email, description });
      alert("Succes", "Je persoonlijke gegevens zijn bijgewerkt!", [
        { text: "OK", onPress: () => safeBack() },
      ]);
    } catch {
      alert("Fout", "Er is iets misgegaan. Probeer het opnieuw.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer topNavTitle="Persoonlijke gegevens" activeTab="profile">
      <YStack paddingHorizontal="$5" gap="$5">
        {loading ? (
          <YStack padding="$10" justifyContent="center" alignItems="center">
            <Spinner size="large" color="$primary" />
          </YStack>
        ) : (
        <>
        <YStack gap="$4">
          <YStack gap="$1.5">
            <Text
              color="$secondary"
              fontSize="$3"
              fontWeight="500"
              marginLeft="$1"
            >
              Voornaam
            </Text>
            <Input
              value={firstName}
              onChangeText={setFirstName}
              backgroundColor="white"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$6"
              paddingHorizontal="$4"
              paddingVertical="$3"
              fontSize="$4"
              color="$text_dark"
              focusStyle={{ borderColor: "$primary" }}
            />
          </YStack>

          <YStack gap="$1.5">
            <Text
              color="$secondary"
              fontSize="$3"
              fontWeight="500"
              marginLeft="$1"
            >
              Achternaam
            </Text>
            <Input
              value={lastName}
              onChangeText={setLastName}
              backgroundColor="white"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$6"
              paddingHorizontal="$4"
              paddingVertical="$3"
              fontSize="$4"
              color="$text_dark"
              focusStyle={{ borderColor: "$primary" }}
            />
          </YStack>

          <YStack gap="$1.5">
            <Text
              color="$secondary"
              fontSize="$3"
              fontWeight="500"
              marginLeft="$1"
            >
              E-mailadres
            </Text>
            <Input
              value={email}
              onChangeText={setEmail}
              backgroundColor="white"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$6"
              paddingHorizontal="$4"
              paddingVertical="$3"
              fontSize="$4"
              color="$text_dark"
              keyboardType="email-address"
              autoCapitalize="none"
              focusStyle={{ borderColor: "$primary" }}
            />
          </YStack>

          <YStack gap="$1.5">
            <Text
              color="$secondary"
              fontSize="$3"
              fontWeight="500"
              marginLeft="$1"
            >
              Beschrijving / Bio
            </Text>
            <TextArea
              value={description}
              onChangeText={setDescription}
              backgroundColor="white"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$6"
              paddingHorizontal="$4"
              paddingVertical="$3"
              fontSize="$4"
              color="$text_dark"
              minHeight={110}
              focusStyle={{ borderColor: "$primary" }}
            />
          </YStack>
        </YStack>

        <XStack gap="$2" alignItems="center" justifyContent="center">
          {saving && <Spinner size="small" color="$primary" />}
          <Button
            label={saving ? "Bezig..." : "Opslaan"}
            onPress={handleSave}
            disabled={saving}
            marginTop="$2"
            flex={1}
          />
        </XStack>
        </>
        )}
      </YStack>
    </PageContainer>
  );
}
