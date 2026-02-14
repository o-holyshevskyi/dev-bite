import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export interface PentagonBadgeProps {
  backgroundColor: string;
  borderColor: string;
  iconName: string;
  iconColor: string;
  isUnlocked: boolean;
}

export function PentagonBadge({
  backgroundColor,
  borderColor,
  iconName,
  iconColor,
  isUnlocked,
}: PentagonBadgeProps) {
  const size = 64;
  const center = size / 2;
  const radius = size / 2 - 6;
  const resolvedBackground = isUnlocked ? backgroundColor : "#333333";
  const resolvedBorder = isUnlocked ? borderColor : "#555555";
  const resolvedIconColor = isUnlocked ? iconColor : "#888888";
  const containerOpacity = isUnlocked ? 1 : 0.5;

  const points = Array.from({ length: 5 }, (_, i) => {
    const angle = Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  });

  const pathData = `M ${points[0].x} ${points[0].y} ${points
    .slice(1)
    .map((p) => `L ${p.x} ${p.y}`)
    .join(" ")} Z`;

  return (
    <View style={[styles.badgeContainer, { opacity: containerOpacity }]}>
      <Svg width={size} height={size} style={styles.pentagonSvg}>
        <Path d={pathData} fill={resolvedBackground} stroke={resolvedBorder} strokeWidth={2} />
      </Svg>
      <View style={styles.iconContainer}>
        <IconSymbol name={iconName as any} size={22} color={resolvedIconColor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
