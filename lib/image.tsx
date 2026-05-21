import React from "react";
import { Image as RNImage, Platform, type ImageSourcePropType, type ImageStyle } from "react-native";

type ContentFit = "cover" | "contain" | "fill" | "none" | "scale-down";

interface ImageProps {
  source: ImageSourcePropType;
  style?: ImageStyle | ImageStyle[];
  contentFit?: ContentFit;
}

const fitToResizeMode: Record<ContentFit, "cover" | "contain" | "stretch" | "center"> = {
  cover: "cover",
  contain: "contain",
  fill: "stretch",
  none: "center",
  "scale-down": "contain",
};

const NativeImage = Platform.OS === "web"
  ? null
  : (require("expo-image") as { Image: React.ComponentType<any> }).Image;

export function Image({ source, style, contentFit }: ImageProps) {
  if (Platform.OS === "web" || !NativeImage) {
    return (
      <RNImage
        source={source}
        style={style}
        resizeMode={contentFit ? fitToResizeMode[contentFit] : undefined}
      />
    );
  }

  return <NativeImage source={source} style={style} contentFit={contentFit} />;
}
