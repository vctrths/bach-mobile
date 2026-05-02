import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "tamagui";

const StyledSafeArea = styled(SafeAreaView, {
    flex: 1,
    backgroundColor: "$white",
});

import { ReactNode } from "react";

export default function ThemedSafeArea({ children }: { children: ReactNode }) {
    return (
        <StyledSafeArea>
            {children}
        </StyledSafeArea>
    )
}
