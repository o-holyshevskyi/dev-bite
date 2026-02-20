import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { useUserStore } from "@/store/userStore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Notifications from "expo-notifications";
import * as Sharing from "expo-sharing";
import { useRouter } from "expo-router";
import { Card, useThemeColor } from "heroui-native";
import { Alert, Pressable, StyleSheet, Switch, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const Preferences = () => {
  const muted = useThemeColor("muted");
  const foreground = useThemeColor("foreground");
  const accent = useThemeColor("accent");
  const router = useRouter();
  const resetStore = useUserStore((state) => state.resetStore);
  const getPortableBackup = useUserStore((state) => state.getPortableBackup);
  const importPortableBackup = useUserStore((state) => state.importPortableBackup);
  const difficulty = useUserStore((state) => state.difficulty);
  const settings = useUserStore((state) => state.settings);
  const updatePreferences = useUserStore((state) => state.updatePreferences);
  const updateSettings = useUserStore((state) => state.updateSettings);
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const difficultyLabel =
    difficulty === "Mid" ? "Middle" : difficulty.length > 0 ? difficulty : "Not set";

  const handleDifficultyPress = () => {
    Alert.alert("Difficulty", "Select your learning difficulty", [
      {
        text: "Junior",
        onPress: () => updatePreferences({ difficulty: "Junior" }),
      },
      {
        text: "Middle",
        onPress: () => updatePreferences({ difficulty: "Mid" }),
      },
      {
        text: "Senior",
        onPress: () => updatePreferences({ difficulty: "Senior" }),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleLogoutPress = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out and reset all local progress?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            resetStore();
            try {
              await AsyncStorage.removeItem('user-store');
            } finally {
              router.replace('/');
            }
          },
        },
      ],
    );
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    updateSettings({ notificationsEnabled: enabled });

    if (!enabled) {
      void Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const handleExportDataPress = async () => {
    try {
      const backup = getPortableBackup();
      const fileName = `devbite-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(backup, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 },
      );

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert("Backup created", `Backup was created at:\n${fileUri}`);
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: "Export DevBite backup",
        UTI: "public.json",
      });
    } catch {
      Alert.alert("Export failed", "Unable to export backup right now. Please try again.");
    }
  };

  const handleImportDataPress = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const picked = result.assets[0];
      if (!picked?.uri) return;

      const fileContent = await FileSystem.readAsStringAsync(picked.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const parsed = JSON.parse(fileContent);
      const importResult = importPortableBackup(parsed);
      if (!importResult.ok) {
        Alert.alert("Import failed", importResult.message);
        return;
      }
      Alert.alert("Import complete", "Your progress backup has been restored.");
    } catch {
      Alert.alert("Import failed", "Selected file is invalid or unreadable.");
    }
  };

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
            type="switch"
            switchValue={settings.notificationsEnabled}
            onSwitchChange={handleNotificationsToggle}
          />
          <PreferenceRow
            iconName="waveform"
            label="Haptic Feedback"
            iconColor={accent}
            foreground={foreground}
            muted={muted}
            type="switch"
            switchValue={settings.hapticsEnabled}
            onSwitchChange={(val) => updateSettings({ hapticsEnabled: val })}
          />
          <PreferenceRow
            iconName="paintbrush"
            label="Difficulty"
            iconColor={accent}
            foreground={foreground}
            muted={muted}
            value={difficultyLabel}
            onPress={handleDifficultyPress}
          />
          <PreferenceRow
            iconName="questionmark.circle"
            label="Help & Support"
            iconColor={accent}
            foreground={foreground}
            muted={muted}
          />
          <PreferenceRow
            iconName="square.and.arrow.up"
            label="Export Data"
            iconColor={accent}
            foreground={foreground}
            muted={muted}
            onPress={handleExportDataPress}
          />
          <PreferenceRow
            iconName="square.and.arrow.down"
            label="Import Data"
            iconColor={accent}
            foreground={foreground}
            muted={muted}
            onPress={handleImportDataPress}
          />
          <PreferenceRow
            iconName="arrow.turn.down.left"
            label="Log Out"
            iconColor="#F97373"
            foreground="#F97373"
            muted={muted}
            isDestructive
            onPress={handleLogoutPress}
          />
          <PreferenceRow
            iconName="info.circle"
            label="App Version"
            iconColor={muted}
            foreground={muted}
            muted={muted}
            value={appVersion}
            showChevron={false}
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
  type?: "link" | "switch";
  onPress?: () => void;
  value?: string;
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
  showChevron?: boolean;
  isDestructive?: boolean;
};

const PreferenceRow = ({
  iconName,
  label,
  iconColor,
  foreground,
  muted,
  type = "link",
  onPress,
  value,
  switchValue = false,
  onSwitchChange,
  showChevron = true,
  isDestructive,
}: PreferenceRowProps) => {
  const isSwitch = type === "switch";
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (isSwitch && onSwitchChange) {
      onSwitchChange(!switchValue);
      return;
    }
    onPress?.();
  };

  const isInteractive = isSwitch ? !!onSwitchChange : !!onPress;

  return (
    <Pressable
      onPress={handlePress}
      disabled={!isInteractive}
      onPressIn={() => {
        scale.value = withSpring(0.97);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
    >
      <Animated.View style={[styles.row, animatedStyle]}>
        <View style={styles.rowLeft}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: iconColor + "20",
              },
            ]}
          >
            <IconSymbol name={iconName as any} size={20} color={iconColor} />
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
        <View style={styles.rowRight}>
          {value ? (
            <ThemedText style={[styles.valueText, { color: muted }]}>
              {value}
            </ThemedText>
          ) : null}
          {isSwitch ? (
            <Switch
              value={switchValue}
              onValueChange={onSwitchChange}
              trackColor={{ false: muted + "66", true: iconColor + "80" }}
              thumbColor={switchValue ? iconColor : "#f5f5f5"}
            />
          ) : showChevron ? (
            <IconSymbol name="chevron.right" size={16} color={muted} />
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
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
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  valueText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default Preferences;

