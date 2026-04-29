import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
        Home
      </Text>
      <Text style={{ fontSize: 16, textAlign: "center" }}>
        Welcome to your clean project. Start building!
      </Text>
    </View>
  );
}
