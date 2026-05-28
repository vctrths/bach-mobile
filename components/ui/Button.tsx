import { Button as TamaguiButton, Text } from "tamagui";

interface ButtonProps extends Omit<React.ComponentProps<typeof TamaguiButton>, "color"> {
  label: string;
  color?: React.ComponentProps<typeof Text>["color"];
  fontWeight?: React.ComponentProps<typeof Text>["fontWeight"];
  fontSize?: React.ComponentProps<typeof Text>["fontSize"];
}

export default function Button({ label, color = "$white", fontWeight = "bold", fontSize, ...props }: ButtonProps) {
  return (
    <TamaguiButton {...props} borderRadius={props.borderRadius ?? 100}>
      <TamaguiButton.Text color={color} fontWeight={fontWeight} fontSize={fontSize}>{label}</TamaguiButton.Text>
    </TamaguiButton>
  );
}
