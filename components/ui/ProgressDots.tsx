import { XStack, View } from "tamagui";

interface ProgressDotsProps {
    total: number;
    current: number;
}

export default function ProgressDots({ total, current }: ProgressDotsProps) {
    return (
        <XStack gap="$2" justifyContent="center" alignItems="center" paddingVertical="$4">
            {Array.from({ length: total }).map((_, index) => {
                const isActive = index === current;
                return (
                    <View
                        key={index}
                        width={isActive ? 24 : 8}
                        height={8}
                        borderRadius={10}
                        backgroundColor={isActive ? "$background" : "$borderColor"}
                    />
                );
            })}
        </XStack>
    );
}
