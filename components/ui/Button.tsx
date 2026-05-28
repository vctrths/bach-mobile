import { Button as TamaguiButton, Text } from "tamagui";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";

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
}> = {
  primary: {
    backgroundColor: "$background",
    color: "$white",
  },
  secondary: {
    backgroundColor: "rgba(23, 51, 0, 0.08)",
    color: "#173300",
  },
  outline: {
    backgroundColor: "transparent",
    color: "#173300",
    borderWidth: 1,
    borderColor: "$background",
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
      borderRadius={props.borderRadius ?? 100}
      backgroundColor={props.backgroundColor ?? styles.backgroundColor}
      borderWidth={props.borderWidth ?? styles.borderWidth}
      borderColor={props.borderColor ?? styles.borderColor}
      disabled={disabled}
      opacity={opacity ?? (disabled ? 0.5 : 1)}
    >
      {icon && <TamaguiButton.Icon>{icon}</TamaguiButton.Icon>}
      <TamaguiButton.Text
        color={color ?? styles.color}
        fontWeight={fontWeight}
        fontSize={fontSize}
      >
        {label}
      </TamaguiButton.Text>
    </TamaguiButton>
  );
}
