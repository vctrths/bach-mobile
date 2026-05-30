import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Card, Text, XStack } from "tamagui";

export const APPLIANCE_MAP: Record<string, { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
  water: { label: "Water", icon: "water" },
  tools: { label: "Gereedschap", icon: "tools" },
  electricity: { label: "Elektriciteit", icon: "flash" },
  toilet: { label: "Toilet", icon: "toilet" },
  compost: { label: "Compost", icon: "leaf" },
  seeds: { label: "Zaden", icon: "seed-outline" },
  shade: { label: "Schaduw", icon: "umbrella" },
  greenhouse: { label: "Serre", icon: "greenhouse" },
};

interface ApplianceBadgesProps {
  appliances: string[] | null;
  detailMode?: boolean;
}

export default function ApplianceBadges({ appliances, detailMode = false }: ApplianceBadgesProps) {
  if (!appliances || appliances.length === 0) return null;

  return (
    <XStack gap={detailMode ? 8 : 4} flexWrap="wrap" alignItems="center">
      {appliances.map((key) => {
        const appliance = APPLIANCE_MAP[key];
        if (!appliance) return null;

        if (detailMode) {
          return (
            <XStack
              key={key}
              backgroundColor="#F0F3EC"
              borderColor="#E3ECD7"
              borderWidth={1}
              borderRadius={32}
              paddingHorizontal={12}
              paddingVertical={6}
              gap={6}
              alignItems="center"
            >
              <MaterialCommunityIcons name={appliance.icon} size={16} color="#172211" />
              <Text fontSize={14} color="#172211" fontWeight="500">
                {appliance.label}
              </Text>
            </XStack>
          );
        }

        return (
          <Card
            key={key}
            width={24}
            height={24}
            backgroundColor="#F0EADC"
            borderRadius={12}
            borderColor="#E3ECD7"
            borderWidth={1}
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
          >
            <MaterialCommunityIcons
              name={appliance.icon}
              size={13}
              color="#172211"
            />
          </Card>
        );
      })}
    </XStack>
  );
}
