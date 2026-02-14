import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { PentagonBadge } from "@/components/ui/pentagon-badge";
import { BADGE_DEFINITIONS } from "@/src/utils/badges";
import useUserStore from "@/store/userStore";
import { useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AllBadgesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const state = useUserStore();
  const foreground = useThemeColor("foreground");
  const muted = useThemeColor("muted");
  const accent = useThemeColor("accent");
  const background = useThemeColor("background");

  return (
    <ScrollView style={[styles.container, { backgroundColor: background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={foreground} />
          <ThemedText style={[styles.backText, { color: foreground }]}>
            Back
          </ThemedText>
        </Pressable>
        <ThemedText style={[styles.topBarTitle, { color: foreground }]}>
          All Achievements
        </ThemedText>
        <View style={styles.rightSpacer} />
      </View>
      <View style={styles.content}>
        {BADGE_DEFINITIONS.map((badge) => {
          const isUnlocked = badge.checkUnlock(state);
          return (
            <View
              key={badge.id}
              style={[
                styles.rowCard,
                {
                  borderColor: muted + "44",
                  backgroundColor: muted + "14",
                },
              ]}
            >
              <PentagonBadge
                backgroundColor={badge.background}
                borderColor={badge.border}
                iconName={badge.iconName}
                iconColor={badge.iconColor}
                isUnlocked={isUnlocked}
              />
              <View style={styles.rowContent}>
                <ThemedText style={[styles.title, { color: foreground }]}>
                  {badge.title}
                </ThemedText>
                <ThemedText style={[styles.description, { color: muted }]}>
                  {badge.description}
                </ThemedText>
                <ThemedText style={[styles.progress, { color: muted }]}>
                  Progress: {badge.getProgressLabel(state)}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.status,
                    { color: isUnlocked ? accent : muted },
                  ]}
                >
                  {isUnlocked ? "Unlocked ✅" : "Locked 🔒"}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 84,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  rightSpacer: {
    width: 84,
    height: 40,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
    gap: 12,
  },
  rowCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  description: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  status: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
  },
  progress: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "500",
  },
});
