import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "heroui-native";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";

const Badges = () => {
  const accent = useThemeColor("accent");
  const muted = useThemeColor("muted");

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText style={[styles.title, { color: muted }]}>
          Recent Badges
        </ThemedText>
        <ThemedText style={[styles.viewAll, { color: accent }]}>
          VIEW ALL
        </ThemedText>
      </View>

      <View style={styles.badgesRow}>
        {BADGES.map((badge) => (
          <PentagonBadge
            key={badge.id}
            backgroundColor={badge.background}
            borderColor={badge.border}
            iconName={badge.iconName}
            iconColor={badge.iconColor}
          />
        ))}
      </View>
    </View>
  );
};

type PentagonBadgeProps = {
  backgroundColor: string;
  borderColor: string;
  iconName: string;
  iconColor: string;
};

const PentagonBadge = ({
  backgroundColor,
  borderColor,
  iconName,
  iconColor,
}: PentagonBadgeProps) => {
  const size = 64;
  const center = size / 2;
  const radius = size / 2 - 6; // Slightly smaller to account for border

  // Calculate pentagon points (5-sided polygon)
  // Starting from top point, going clockwise
  const points = Array.from({ length: 5 }, (_, i) => {
    const angle = (Math.PI / 2) + (i * 2 * Math.PI) / 5; // Start from top
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  });

  const pathData = `M ${points[0].x} ${points[0].y} ${points
    .slice(1)
    .map((p) => `L ${p.x} ${p.y}`)
    .join(" ")} Z`;

  return (
    <View style={styles.badgeContainer}>
      <Svg width={size} height={size} style={styles.pentagonSvg}>
        <Path
          d={pathData}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={2}
        />
      </Svg>
      <View style={styles.iconContainer}>
        <IconSymbol name={iconName as any} size={22} color={iconColor} />
      </View>
    </View>
  );
};

const BADGES = [
  {
    id: "sparkles",
    background: "#0FA36B33",
    border: "#0FA36B80",
    iconName: "sparkles",
    iconColor: "#FFFFFF",
  },
  {
    id: "bug",
    background: "#0891B233",
    border: "#0891B280",
    iconName: "ladybug.fill",
    iconColor: "#FFFFFF",
  },
  {
    id: "lightning",
    background: "#7C3AED33",
    border: "#7C3AED80",
    iconName: "bolt.fill",
    iconColor: "#FFFFFF",
  },
  {
    id: "folder",
    background: "#FBBF2433",
    border: "#FBBF2480",
    iconName: "folder.fill",
    iconColor: "#FFFFFF",
  },
  {
    id: "trophy",
    background: "#1F293733",
    border: "#1F293780",
    iconName: "trophy.fill",
    iconColor: "#FFFFFF",
  },
];

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
    alignItems: "center",
    gap: 12,
  },
  badgeContainer: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pentagonSvg: {
    position: "absolute",
  },
  iconContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
});

export default Badges;

