import { pages } from "@/types/app";
import { ReactNode } from "react";
import { YStack } from "tamagui";
import BottomNav from "./BottomNav";
import ThemedSafeArea from "./ThemedSafeArea";
import TopNavPill from "./TopNavPill";

interface PageContainerProps {
  children: ReactNode;
  showTopNav?: boolean;
  topNavTitle?: React.ReactNode | string;
  hideBack?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  topNavChildren?: React.ReactNode;
  activeTab?: pages;
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

      <YStack flex={1} paddingVertical={"$14"} paddingHorizontal="$4">
        {children}
      </YStack>

      {showBottomNav && <BottomNav activeTab={activeTab} />}
    </ThemedSafeArea>
  );
}
