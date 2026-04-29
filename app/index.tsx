import Button from "@/components/ui/Button";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Landing() {
  return (
    <SafeAreaView>
      <Button
        label="Maak een account aan"
        onPress={() => router.push("/onboarding")}
      />
      <Button label="Ik heb al een account" variant="outlined" />
    </SafeAreaView>
  );
}
