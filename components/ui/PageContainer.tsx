import { pages } from "@/types/app";
import { ReactNode } from "react";
import { RefreshControlProps } from "react-native";
import { ScrollView, YStack } from "tamagui";
import BottomNav from "./BottomNav";
import ThemedSafeArea from "./ThemedSafeArea";
import TopNavPill from "./TopNavPill";

interface PageContainerProps {
  children: ReactNode;
  showTopNav?: boolean;
  topNavTitle?: ReactNode | string;
  hideBack?: boolean;
  onBackPress?: () => void;
  rightElement?: ReactNode;
  topNavChildren?: ReactNode;
  activeTab?: pages;
  showBottomNav?: boolean;
  topNavHeight?: number;
  bottomNavExtraMargin?: number;
  contentPaddingBottom?: number;
  scrollable?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

const DEFAULT_TOP_NAV_HEIGHT = 76;
const DEFAULT_BOTTOM_NAV_HEIGHT = 82;
const GAP = 20;

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
  topNavHeight = DEFAULT_TOP_NAV_HEIGHT,
  bottomNavExtraMargin = 20,
  contentPaddingBottom,
  scrollable = true,
  refreshControl,
}: PageContainerProps) {
  const effectiveTopNavHeight = topNavHeight + (topNavChildren ? 50 : 0);

  const calculatedPaddingBottom =
    contentPaddingBottom !== undefined
      ? contentPaddingBottom
      : showBottomNav
        ? DEFAULT_BOTTOM_NAV_HEIGHT + bottomNavExtraMargin + GAP + 30
        : GAP;

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

      {scrollable ? (
        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: effectiveTopNavHeight + GAP,
            paddingBottom: calculatedPaddingBottom,
          }}
          scrollEventThrottle={16}
          refreshControl={refreshControl}
        >
          <YStack>{children}</YStack>
        </ScrollView>
      ) : (
        <YStack
          flex={1}
          paddingTop={effectiveTopNavHeight + GAP}
          paddingBottom={calculatedPaddingBottom}
        >
          {children}
        </YStack>
      )}

      {showBottomNav && <BottomNav activeTab={activeTab} />}
    </ThemedSafeArea>
  );
}
