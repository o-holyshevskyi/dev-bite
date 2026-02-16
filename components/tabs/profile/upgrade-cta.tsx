import { ThemedText } from "@/components/themed-text";
import { useRouter } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const UpgradeCta = () => {
  const router = useRouter();
  const accent = useThemeColor("accent");
  const background = useThemeColor("background");
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleUpgradePress = () => {
    router.push('/paywall');
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.97);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
      >
        <Animated.View style={animatedStyle}>
          <Button
            size="lg"
            onPress={handleUpgradePress}
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
        </Animated.View>
      </Pressable>
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

