import { ReactNode } from "react";
import { H1, Text, YStack } from "tamagui";

interface InfoProps {
  image: ReactNode;
  title: string;
  description: string;
}

export default function Info({ image, title, description }: InfoProps) {
  return (
    <YStack alignItems="center" gap="$4">
      {image}
      <H1 color="$primary" fontWeight="bold" textAlign="center">
        {title}
      </H1>
      <Text color="$secondary" textAlign="center">
        {description}
      </Text>
    </YStack>
  );
}
