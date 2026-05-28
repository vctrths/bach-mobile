import { Text, XStack } from "tamagui";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "decline" | "accept";

interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  icon?: ReactNode;
  color?: string;
  fontWeight?: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
  fontSize?: number;
  disabled?: boolean;
  opacity?: number;
  onPress?: () => void;
  flex?: number;
  marginVertical?: number | string;
  marginHorizontal?: number | string;
  marginTop?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  marginRight?: number | string;
  paddingVertical?: number;
  paddingHorizontal?: number;
  borderRadius?: number;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
}

const VARIANT_STYLES: Record<ButtonVariant, {
  backgroundColor: string;
  color: string;
  borderWidth?: number;
  borderColor?: string;
  pressBackgroundColor: string;
  paddingVertical: number;
  paddingHorizontal: number;
  fontSize: number;
}> = {
  primary: {
    backgroundColor: "$button_primary_bg",
    color: "$button_primary_text",
    pressBackgroundColor: "$button_primary_hover",
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  secondary: {
    backgroundColor: "$button_secondary_bg",
    color: "$button_secondary_text",
    borderWidth: 1,
    borderColor: "$button_secondary_border",
    pressBackgroundColor: "$button_secondary_bg",
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  decline: {
    backgroundColor: "$button_decline_bg",
    color: "$button_decline_text",
    pressBackgroundColor: "$button_decline_bg",
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  accept: {
    backgroundColor: "$button_accept_bg",
    color: "$button_accept_text",
    pressBackgroundColor: "$button_accept_bg",
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 14,
  },
};

export default function Button({
  label,
  variant = "primary",
  icon,
  color,
  fontWeight = "bold",
  fontSize,
  disabled,
  opacity,
  onPress,
  flex,
  marginVertical,
  marginHorizontal,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  paddingVertical,
  paddingHorizontal,
  borderRadius,
  backgroundColor,
  borderWidth,
  borderColor,
}: ButtonProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <XStack
      onPress={onPress}
      flex={flex}
      marginVertical={marginVertical}
      marginHorizontal={marginHorizontal}
      marginTop={marginTop}
      marginBottom={marginBottom}
      marginLeft={marginLeft}
      marginRight={marginRight}
      borderRadius={borderRadius ?? 64}
      backgroundColor={backgroundColor ?? styles.backgroundColor}
      borderWidth={borderWidth ?? styles.borderWidth}
      borderColor={borderColor ?? styles.borderColor}
      paddingVertical={paddingVertical ?? styles.paddingVertical}
      paddingHorizontal={paddingHorizontal ?? styles.paddingHorizontal}
      alignItems="center"
      justifyContent="center"
      gap={8}
      opacity={opacity ?? (disabled ? 0.5 : 1)}
      pressStyle={{
        backgroundColor: styles.pressBackgroundColor,
        ...(variant === "secondary" && { borderColor: "$button_secondary_hover_border" }),
        scale: 0.98,
      }}
      disabled={disabled}
    >
      {icon && icon}
      <Text
        color={color ?? styles.color}
        fontWeight={fontWeight}
        fontSize={fontSize ?? styles.fontSize}
        lineHeight={(fontSize ?? styles.fontSize) * 1.2}
      >
        {label}
      </Text>
    </XStack>
  );
}
