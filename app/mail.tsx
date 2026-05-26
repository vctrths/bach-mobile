import PageContainer from "@/components/ui/PageContainer";
import ScreenContent from "@/components/ui/ScreenContent";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Card, Text, XStack, YStack } from "tamagui";

const MOCK_EMAILS = [
  {
    id: "1",
    from: "Groene Vingers",
    subject: "Welkom bij Groene Vingers!",
    preview: "Bedankt voor je registratie. Ontdek nu tuinen in jouw buurt...",
    time: "Gisteren",
    read: false,
  },
  {
    id: "2",
    from: "Anna De Vries",
    subject: "Aanvraag tuinonderhoud",
    preview: "Hallo! Ik zou graag willen helpen met je moestuin. Wanneer kan ik langskomen?",
    time: "3 dagen geleden",
    read: true,
  },
  {
    id: "3",
    from: "Groene Vingers",
    subject: "Je Pro-abonnement verloopt binnenkort",
    preview: "Je Pro-abonnement loopt af op 15 juni. Verleng nu met 20% korting...",
    time: "1 week geleden",
    read: true,
  },
];

export default function MailScreen() {
  return (
    <PageContainer
      topNavTitle="Mail"
      onBackPress={() => router.back()}
      activeTab="profile"
    >
      <ScreenContent>
        <YStack flex={1} paddingHorizontal="$4" paddingTop="$4" gap="$3">
          {MOCK_EMAILS.map((email) => (
            <Card
              key={email.id}
              elevation={2}
              backgroundColor={email.read ? "white" : "rgba(227, 236, 215, 0.5)"}
              borderColor="rgba(23, 51, 0, 0.1)"
              borderWidth={1}
              borderRadius="$6"
              padding="$4"
              gap="$2"
            >
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$4" fontWeight="bold" color="$text_dark">
                  {email.from}
                </Text>
                <Text fontSize="$2" color="$secondary">
                  {email.time}
                </Text>
              </XStack>
              <Text fontSize="$3" fontWeight="600" color="$text_dark">
                {email.subject}
              </Text>
              <Text fontSize="$3" color="$secondary" numberOfLines={2}>
                {email.preview}
              </Text>
              {!email.read && (
                <XStack
                  width={10}
                  height={10}
                  borderRadius={5}
                  backgroundColor="#22c55e"
                  position="absolute"
                  top={16}
                  right={16}
                />
              )}
            </Card>
          ))}
        </YStack>
      </ScreenContent>
    </PageContainer>
  );
}
