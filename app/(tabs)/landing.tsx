import Button from "@/components/ui/Button";
import { SafeAreaView } from "react-native-safe-area-context";

function test() {
  console.log("test");
}

export default function Landing() {
  return (
    <SafeAreaView>
      <Button label="button" onPress={test} />
    </SafeAreaView>
  );
}
