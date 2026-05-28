import { Button as TamaguiButton, Text, XStack } from "tamagui";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "decline" | "accept";

interface ButtonProps extends Omit<React.ComponentProps<typeof TamaguiButton>, "color"> {
  label: string;
  variant?: ButtonVariant;
  icon?: ReactNode;
  color?: React.ComponentProps<typeof Text>["color"];
  fontWeight?: React.ComponentProps<typeof Text>["fontWeight"];
  fontSize?: React.ComponentProps<typeof Text>["fontSize"];
}

const VARIANT_STYLES: Record<ButtonVariant, {
  backgroundColor: string;
  color: string;
  borderWidth?: number;
  borderColor?: string;
  hoverBackgroundColor: string;
  paddingVertical: number;
  paddingHorizontal: number;
  fontSize: number;
}> = {
  primary: {
    backgroundColor: "$button_primary_bg",
    color: "$button_primary_text",
    hoverBackgroundColor: "$button_primary_hover",
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  secondary: {
    backgroundColor: "$button_secondary_bg",
    color: "$button_secondary_text",
    borderWidth: 1,
    borderColor: "$button_secondary_border",
    hoverBackgroundColor: "$button_secondary_bg",
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  decline: {
    backgroundColor: "$button_decline_bg",
    color: "$button_decline_text",
    hoverBackgroundColor: "$button_decline_bg",
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  accept: {
    backgroundColor: "$button_accept_bg",
    color: "$button_accept_text",
    hoverBackgroundColor: "$button_accept_bg",
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
  ...props
}: ButtonProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <TamaguiButton
      {...props}
      borderRadius={props.borderRadius ?? 64}
      backgroundColor={props.backgroundColor ?? styles.backgroundColor}
      borderWidth={props.borderWidth ?? styles.borderWidth}
      borderColor={props.borderColor ?? styles.borderColor}
      paddingVertical={props.paddingVertical ?? styles.paddingVertical}
      paddingHorizontal={props.paddingHorizontal ?? styles.paddingHorizontal}
      disabled={disabled}
      opacity={opacity ?? (disabled ? 0.5 : 1)}
      hoverStyle={{
        backgroundColor: styles.hoverBackgroundColor,
        ...(variant === "secondary" && { borderColor: "$button_secondary_hover_border" }),
      }}
    >
      <XStack gap={8} alignItems="center" justifyContent="center">
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
    </TamaguiButton>
  );
}
