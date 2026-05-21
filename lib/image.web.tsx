import React from "react";
import { Image as RNImage, type ImageStyle, type ImageSourcePropType } from "react-native";

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

export function Image({ source, style, contentFit }: ImageProps) {
  return (
    <RNImage
      source={source}
      style={style}
      resizeMode={contentFit ? fitToResizeMode[contentFit] : undefined}
    />
  );
}
