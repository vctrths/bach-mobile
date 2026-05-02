import { Button as TamaguiButton } from "tamagui";

interface ButtonProps extends Omit<React.ComponentProps<typeof TamaguiButton>, "color"> {
  label: string;
  color?: string;
}

export default function Button({ label, color = "$white", ...props }: ButtonProps) {
  return (
    <TamaguiButton {...props} borderRadius={100}>
      <TamaguiButton.Text color={color} fontWeight="bold">{label}</TamaguiButton.Text>
    </TamaguiButton>
  );
}
