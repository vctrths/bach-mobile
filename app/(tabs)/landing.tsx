import { ThemedText } from "@/components/themed-text";
import Button from "@/components/ui/Button";
import { SafeAreaView } from "react-native-safe-area-context";

function test() {
  console.log("test");
}

export default function Landing() {
  return (
    <SafeAreaView>
      <ThemedText>Testing</ThemedText>
      <Button
        onPress={test}
        label="Learn More"
        accessibilityLabel="Learn more about this purple button"
      />
    </SafeAreaView>
  );
}
