import { Button as TamaguiButton } from "tamagui";

interface ButtonProps extends React.ComponentProps<typeof TamaguiButton> {
  label: string;
}

export default function Button({ label, ...props }: ButtonProps) {
  return (
    <TamaguiButton {...props}>
      {label}
    </TamaguiButton>
  );
}
