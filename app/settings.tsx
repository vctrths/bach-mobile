import PageContainer from "@/components/ui/PageContainer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform } from "react-native";
import { Card, Circle, Spinner, Text, XStack, YStack } from "tamagui";

export default function SettingsScreen() {
  const { signOut, profile } = useAuth();
  const isOwner = profile?.role?.toLowerCase() === "tuineigenaar";
  const [deleting, setDeleting] = useState(false);

  const handleVerify = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      if (Platform.OS === 'web') {
        window.alert("Je bent niet ingelogd.");
      } else {
        Alert.alert("Fout", "Je bent niet ingelogd.");
      }
      return;
    }
    if (user.email_confirmed_at) {
      if (Platform.OS === 'web') {
        window.alert("Je account is al geverifieerd.");
      } else {
        Alert.alert("Account verifiëren", "Je account is al geverifieerd.");
      }
    } else {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email!,
      });
      if (error) {
        if (Platform.OS === 'web') {
          window.alert(error.message);
        } else {
          Alert.alert("Fout", error.message);
        }
      } else {
        if (Platform.OS === 'web') {
          window.alert("Check je e-mail om je account te verifiëren.");
        } else {
          Alert.alert(
            "Verificatie verstuurd",
            "Check je e-mail om je account te verifiëren."
          );
        }
      }
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);
      if (error) {
        if (Platform.OS === 'web') {
          window.alert("Kon account niet verwijderen.");
        } else {
          Alert.alert("Fout", "Kon account niet verwijderen.");
        }
        setDeleting(false);
        return;
      }

      await signOut();
      router.replace("/login");
    } catch {
      if (Platform.OS === 'web') {
        window.alert("Er is iets misgegaan. Probeer opnieuw.");
      } else {
        Alert.alert("Fout", "Er is iets misgegaan. Probeer opnieuw.");
      }
      setDeleting(false);
    }
  };

  const accountItems = [
    {
      id: "persoonlijk",
      label: "Persoonlijke gegevens",
      onPress: () => router.push("/personal-details"),
    },
    ...(!isOwner
      ? [
          {
            id: "abonnement",
            label: "Abonnement",
            onPress: () => router.push("/pro"),
          },
        ]
      : []),
    {
      id: "verifieer",
      label: "Account verifiëren",
      onPress: handleVerify,
    },
    {
      id: "notificaties",
      label: "Notificaties",
      onPress: () => router.push("/notifications"),
    },
  ];

  const meerItems = [
    {
      id: "verwijder",
      label: "Account verwijderen",
      icon: deleting ? (
        <Spinner size="small" color="#D32F2F" />
      ) : (
        <Circle
          size={38}
          backgroundColor="rgba(211, 47, 47, 0.08)"
          justifyContent="center"
          alignItems="center"
        >
          <Ionicons name="trash-outline" size={20} color="#D32F2F" />
        </Circle>
      ),
      onPress: () => {
        if (Platform.OS === 'web') {
          const confirmed = window.confirm("Weet je zeker dat je je account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.");
          if (confirmed) handleDeleteAccount();
        } else {
          Alert.alert(
            "Account verwijderen",
            "Weet je zeker dat je je account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.",
            [
              { text: "Annuleren", style: "cancel" },
              {
                text: "Verwijderen",
                style: "destructive",
                onPress: handleDeleteAccount,
              },
            ]
          );
        }
      },
    },
    {
      id: "uitloggen",
      label: "Uitloggen",
      icon: (
        <Circle
          size={38}
          backgroundColor="rgba(211, 47, 47, 0.08)"
          justifyContent="center"
          alignItems="center"
        >
          <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
        </Circle>
      ),
      onPress: () => {
        if (Platform.OS === 'web') {
          const confirmed = window.confirm("Weet je zeker dat je wilt uitloggen?");
          if (confirmed) {
            (async () => {
              await signOut();
              router.replace("/login");
            })();
          }
        } else {
          Alert.alert("Uitloggen", "Weet je zeker dat je wilt uitloggen?", [
            { text: "Annuleren", style: "cancel" },
            {
              text: "Uitloggen",
              style: "destructive",
              onPress: async () => {
                await signOut();
                router.replace("/login");
              },
            },
          ]);
        }
      },
    },
  ];

  return (
    <PageContainer topNavTitle="Instellingen" activeTab="profile">
      <YStack paddingHorizontal="$5" gap="$5">
        {!isOwner && (
          <Card
            backgroundColor="rgba(227, 236, 215, 0.5)"
            borderColor="rgba(227, 236, 215, 0.85)"
            borderWidth={1}
            borderRadius="$10"
            paddingVertical="$3.5"
            paddingHorizontal="$4"
            alignItems="center"
            justifyContent="center"
            onPress={() => router.push("/pro")}
            pressStyle={{ scale: 0.98, opacity: 0.9 }}
          >
            <Text
              fontSize="$4"
              color="$text_dark"
              fontWeight="500"
              opacity={0.85}
            >
              Upgrade naar Pro voor onbeperkte aanvragen
            </Text>
          </Card>
        )}

        <YStack gap="$2.5">
          <Text
            color="$secondary"
            fontSize="$3"
            fontWeight="500"
            marginLeft="$1"
          >
            Account
          </Text>
          {accountItems.map((item) => (
            <Card
              key={item.id}
              flexDirection="row"
              backgroundColor="white"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$6"
              paddingHorizontal="$4"
              paddingVertical="$3.5"
              justifyContent="space-between"
              alignItems="center"
              onPress={item.onPress}
              pressStyle={{ scale: 0.98, opacity: 0.85 }}
            >
              <Text color="$text_dark" fontSize="$4" fontWeight="500">
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#57594D" />
            </Card>
          ))}
        </YStack>

        <YStack gap="$2.5">
          <Text
            color="$secondary"
            fontSize="$3"
            fontWeight="500"
            marginLeft="$1"
          >
            Meer
          </Text>
          {meerItems.map((item) => (
            <Card
              key={item.id}
              flexDirection="row"
              backgroundColor="white"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$6"
              paddingHorizontal="$4"
              paddingVertical="$3"
              justifyContent="space-between"
              alignItems="center"
              onPress={item.onPress}
              pressStyle={{ scale: 0.98, opacity: 0.85 }}
            >
              <Text color="$text_dark" fontSize="$4" fontWeight="500">
                {item.label}
              </Text>
              {item.icon}
            </Card>
          ))}
        </YStack>
      </YStack>
    </PageContainer>
  );
}