import { useState } from "react";
import Button from "./Button";

import { YStack } from "tamagui";

import Info from "./Info";

import JournalImage from "@/assets/images/info/journal.svg";
import LocationImage from "@/assets/images/info/location.svg";
import TrustImage from "@/assets/images/info/trust.svg";
import { router } from "expo-router";

const onboardingSteps = [
  {
    image: <JournalImage />,
    title: "Houd alles bij",
    description:
      "Documenteer je perceelbezoeken, noteer opvolgingen en volg je groei seizoen per seizoen.",
  },
  {
    image: <LocationImage />,
    title: "Vind jouw groene plek",
    description:
      "Ontdek privétuinen in jouw buurt die deelbaar zijn. Dicht bij huis, op maat.",
  },
  {
    image: <TrustImage />,
    title: "Verbind met vertrouwen",
    description:
      "Chat met tuineigenaars, bekijk hun profiel en ratings. Alles verloopt veilig.",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  function handleStep() {
    if (step <= 1) {
      setStep((step) => step + 1);
    } else {
      router.push("/onboarding/accountSelect");
    }
  }
  return (
    <YStack flex={1} justifyContent="space-between" paddingVertical="$12">
      <YStack marginTop="$4">
        <Info
          image={onboardingSteps[step].image}
          title={onboardingSteps[step].title}
          description={onboardingSteps[step].description}
        />
      </YStack>

      <Button
        label="Volgende"
        onPress={() => handleStep()}
      />
    </YStack>
  );
}
