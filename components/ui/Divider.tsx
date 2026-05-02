import { styled, View, Text, XStack } from "tamagui";

const DividerLine = styled(View, {
    height: 1,
    flex: 1,
    backgroundColor: "$divider",
});

interface DividerProps {
    hasLabel?: boolean;
    label?: string;
}

export default function Divider({ hasLabel, label = "of" }: DividerProps) {
    if (hasLabel) {
        return (
            <XStack alignItems="center" gap="$4" paddingHorizontal="$4">
                <DividerLine />
                <Text color="$secondary" fontSize="$3">{label}</Text>
                <DividerLine />
            </XStack>
        );
    }

    return <DividerLine />;
}
