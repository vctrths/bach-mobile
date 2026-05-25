import { ReactNode } from "react";
import { YStack } from "tamagui";
import BottomNav from "./BottomNav";
import TopNavPill from "./TopNavPill";
import ThemedSafeArea from "./ThemedSafeArea";

interface PageContainerProps {
  children: ReactNode;
  showTopNav?: boolean;
  topNavTitle?: React.ReactNode | string;
  hideBack?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  topNavChildren?: React.ReactNode;
  activeTab?: "home" | "map" | "message" | "profile";
  showBottomNav?: boolean;
}

export default function PageContainer({
  children,
  showTopNav = true,
  topNavTitle,
  hideBack = false,
  onBackPress,
  rightElement,
  topNavChildren,
  activeTab = "home",
  showBottomNav = true,
}: PageContainerProps) {
  return (
    <ThemedSafeArea>
      {showTopNav && (
        <TopNavPill
          title={topNavTitle || ""}
          hideBack={hideBack}
          onBackPress={onBackPress}
          rightElement={rightElement}
        >
          {topNavChildren}
        </TopNavPill>
      )}

      <YStack flex={1} paddingTop="$14" paddingHorizontal="$4">
        {children}
      </YStack>

      {showBottomNav && <BottomNav activeTab={activeTab} />}
    </ThemedSafeArea>
  );
}
