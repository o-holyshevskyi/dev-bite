import { ThemedText } from "@/components/themed-text";
import { useUserStore } from "@/store/userStore";
import { PentagonBadge } from "@/components/ui/pentagon-badge";
import { getBadgesWithUnlockState } from "@/src/utils/badges";
import { useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Pressable, StyleSheet, View } from "react-native";

const Badges = () => {
  const router = useRouter();
  const accent = useThemeColor("accent");
  const muted = useThemeColor("muted");
  const state = useUserStore();

  const recentBadges = getBadgesWithUnlockState(state)
    .sort((a, b) => Number(b.isUnlocked) - Number(a.isUnlocked))
    .slice(0, 5);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText style={[styles.title, { color: muted }]}>
          Recent Badges
        </ThemedText>
        <Pressable onPress={() => router.push("/badges")}>
          <ThemedText style={[styles.viewAll, { color: accent }]}>
            VIEW ALL
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.badgesRow}>
        {recentBadges.map((badge) => (
          <View key={badge.id} style={styles.badgeItem}>
            <PentagonBadge
              backgroundColor={badge.background}
              borderColor={badge.border}
              iconName={badge.iconName}
              iconColor={badge.iconColor}
              isUnlocked={badge.isUnlocked}
            />
            <ThemedText style={[styles.badgeTitle, { color: muted }]} numberOfLines={2}>
              {badge.title}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  badgeItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  badgeTitle: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 14,
    fontWeight: "600",
  },
});

export default Badges;

