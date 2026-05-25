import { Button as TamaguiButton } from "tamagui";

interface ButtonProps extends Omit<React.ComponentProps<typeof TamaguiButton>, "color"> {
  label: string;
  color?: string;
  fontWeight?: string;
  fontSize?: number | string;
}

export default function Button({ label, color = "$white", fontWeight = "bold", fontSize, ...props }: ButtonProps) {
  return (
    <TamaguiButton {...props} borderRadius={props.borderRadius ?? 100}>
      <TamaguiButton.Text color={color} fontWeight={fontWeight} fontSize={fontSize}>{label}</TamaguiButton.Text>
    </TamaguiButton>
  );
}
