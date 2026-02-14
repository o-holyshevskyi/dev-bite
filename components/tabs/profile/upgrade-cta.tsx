import { ThemedText } from "@/components/themed-text";
import { Button, useThemeColor } from "heroui-native";
import { StyleSheet, View } from "react-native";

const UpgradeCta = () => {
  const accent = useThemeColor("accent");
  const background = useThemeColor("background");

  return (
    <View style={styles.container}>
      <Button
        size="lg"
        style={[
          styles.button,
          {
            backgroundColor: accent,
          },
        ]}
      >
        <ThemedText style={[styles.label, { color: background }]}>
          Upgrade to Pro
        </ThemedText>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  button: {
    borderRadius: 999,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

export default UpgradeCta;

