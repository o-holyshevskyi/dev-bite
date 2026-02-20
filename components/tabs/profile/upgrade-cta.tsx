import { ThemedText } from "@/components/themed-text";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const UpgradeCta = () => {
  const router = useRouter();
  const unlockPro = useUserStore((state) => state.unlockPro);
  const accent = useThemeColor("accent");
  const background = useThemeColor("background");
  const muted = useThemeColor("muted");
  const scale = useSharedValue(1);
  const [isRestoring, setIsRestoring] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleUpgradePress = () => {
    router.push('/paywall');
  };

  const handleRestorePress = () => {
    if (isRestoring) return;

    setIsRestoring(true);

    setTimeout(() => {
      unlockPro();
      setIsRestoring(false);
      Alert.alert("Purchases restored!", "Welcome back to DevBite Pro.");
    }, 1500);
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
            isDisabled={isRestoring}
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
      <Pressable onPress={handleRestorePress} disabled={isRestoring} style={styles.restoreButton}>
        {isRestoring ? (
          <View style={styles.restoreLoading}>
            <ActivityIndicator size="small" color={muted} />
            <ThemedText style={[styles.restoreText, { color: muted }]}>
              Restoring purchases...
            </ThemedText>
          </View>
        ) : (
          <ThemedText style={[styles.restoreText, { color: accent }]}>
            Restore Purchases
          </ThemedText>
        )}
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
  restoreButton: {
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24,
  },
  restoreLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  restoreText: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    textDecorationLine: "underline",
  },
});

export default UpgradeCta;

