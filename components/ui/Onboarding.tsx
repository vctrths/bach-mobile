import { useState } from "react";
import Button from "./Button";

import { Text, YStack } from "tamagui";

import Info from "./Info";

import JournalImage from "@/assets/images/info/journal.svg";
import LocationImage from "@/assets/images/info/location.svg";
import TrustImage from "@/assets/images/info/trust.svg";

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
    if (step <= 2) {
      setStep((step) => step + 1);
    } else {
      console.log("oopsie");
    }
  }
  return (
    <YStack gap="$12">
      {step <= 2 ? (
        <Info
          image={onboardingSteps[step].image}
          title={onboardingSteps[step].title}
          description={onboardingSteps[step].description}
        />
      ) : (
        <Text color="$primary">tuinzoeker | tuineigenaar</Text>
      )}
      <Button label="Volgende" onPress={() => handleStep()} />
    </YStack>
  );
}
