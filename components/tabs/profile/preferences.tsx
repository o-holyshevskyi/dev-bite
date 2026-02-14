import { ThemedText } from "@/components/themed-text";
import { Card, useThemeColor } from "heroui-native";
import { StyleSheet, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";

const Preferences = () => {
  const muted = useThemeColor("muted");
  const foreground = useThemeColor("foreground");
  const accent = useThemeColor("accent");

  return (
    <View style={styles.container}>
      <Card
        style={[
          styles.card,
          {
            borderColor: muted + "40",
            backgroundColor: muted + "10",
          },
        ]}
      >
        <Card.Body style={styles.body}>
          <PreferenceRow
            iconName="bell"
            label="Notifications"
            iconColor={accent}
            foreground={foreground}
            muted={muted}
          />
          <PreferenceRow
            iconName="paintbrush"
            label="Theme Preferences"
            iconColor={accent}
            foreground={foreground}
            muted={muted}
          />
          <PreferenceRow
            iconName="questionmark.circle"
            label="Help & Support"
            iconColor={accent}
            foreground={foreground}
            muted={muted}
          />
          <PreferenceRow
            iconName="arrow.turn.down.left"
            label="Log Out"
            iconColor="#F97373"
            foreground="#F97373"
            muted={muted}
            isDestructive
          />
        </Card.Body>
      </Card>
    </View>
  );
};

type PreferenceRowProps = {
  iconName: string;
  label: string;
  iconColor: string;
  foreground: string;
  muted: string;
  isDestructive?: boolean;
};

const PreferenceRow = ({
  iconName,
  label,
  iconColor,
  foreground,
  muted,
  isDestructive,
}: PreferenceRowProps) => {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: iconColor + "20",
            },
          ]}
        >
          <IconSymbol name={iconName} size={20} color={iconColor} />
        </View>
        <ThemedText
          style={[
            styles.rowLabel,
            { color: isDestructive ? "#F97373" : foreground },
          ]}
        >
          {label}
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={16} color={muted} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 32,
    marginBottom: 32,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  body: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Preferences;

