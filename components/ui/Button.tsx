import { Button as TamaguiButton } from "tamagui";

export default function Button(
  props: React.ComponentProps<typeof TamaguiButton>,
) {
  return <TamaguiButton {...props} />;
}
