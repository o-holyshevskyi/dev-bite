import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { useUserStore } from "@/store/userStore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import * as Sharing from "expo-sharing";
import { useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { useEffect, useState } from "react";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Uniwind } from "uniwind";
import { getEffectiveTheme } from "@/src/utils/theme";
import type { ColorMode, ThemePalette } from "@/store/userStore";

const PALETTE_OPTIONS: Array<{
  id: ThemePalette;
  label: string;
  backgroundColor: string;
  accentColor: string;
}> = [
  { id: "default", label: "Default", backgroundColor: "#f7f7f8", accentColor: "#6366f1" },
  { id: "ocean", label: "Ocean", backgroundColor: "#e8f0f5", accentColor: "#0ea5e9" },
  { id: "mint", label: "Mint", backgroundColor: "#e8f5f0", accentColor: "#10b981" },
  { id: "dark-pro", label: "Dark Pro", backgroundColor: "#000000", accentColor: "#818cf8" },
];

type ThemeSwatchProps = {
  id: string;
  label: string;
  backgroundColor: string;
  accentColor: string;
  isActive: boolean;
  borderColor: string;
  labelColor: string;
  onPress: () => void;
};

function ThemeSwatch({
  label,
  backgroundColor,
  accentColor,
  isActive,
  borderColor,
  labelColor,
  onPress,
}: ThemeSwatchProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
    >
      <Animated.View style={[styles.swatchOuter, animatedStyle]}>
        <View
          style={[
            styles.swatchCircleWrapper,
            Platform.OS === "ios" && styles.swatchCircleShadow,
            isActive && {
              borderColor,
              borderWidth: 3,
              ...(Platform.OS === "ios"
                ? {
                    shadowColor: borderColor,
                    shadowOffset: { width: 5, height: 5 },
                    shadowOpacity: 0.7,
                    shadowRadius: 10,
                  }
                : { elevation: 10 }),
            },
          ]}
        >
          <View style={[styles.swatchPreview, { backgroundColor: accentColor }]} />
        </View>
        <ThemedText style={[styles.swatchLabel, { color: labelColor }]} numberOfLines={1}>
          {label}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

type AccordionItemProps = {
  id: string;
  title: string;
  iconName?: string;
  expanded: boolean;
  onToggle: (id: string) => void;
  hapticsEnabled: boolean;
  foreground: string;
  muted: string;
  accent: string;
  children: React.ReactNode;
};

function AccordionItem({
  id,
  title,
  iconName,
  expanded,
  onToggle,
  hapticsEnabled,
  foreground,
  muted,
  accent,
  children,
}: AccordionItemProps) {
  const openVal = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    openVal.value = withTiming(expanded ? 1 : 0, { duration: 220 });
  }, [expanded, openVal]);

  const contentStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(openVal.value, [0, 1], [0, 3000]),
    opacity: interpolate(openVal.value, [0, 0.5], [0, 1]),
    overflow: "hidden" as const,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(openVal.value, [0, 1], [0, 90])}deg` }],
  }));

  const handlePress = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle(id);
  };

  return (
    <View style={[accordionStyles.item, { borderBottomColor: muted + "30" }]}>
      <Pressable onPress={handlePress} style={accordionStyles.header}>
        <View style={accordionStyles.headerLeft}>
          {iconName != null && (
            <View style={[accordionStyles.headerIcon, { backgroundColor: accent + "20" }]}>
              <IconSymbol name={iconName as any} size={18} color={accent} />
            </View>
          )}
          <ThemedText style={[accordionStyles.headerTitle, { color: foreground }]}>
            {title}
          </ThemedText>
        </View>
        <Animated.View style={chevronStyle}>
          <IconSymbol name="chevron.right" size={18} color={muted} />
        </Animated.View>
      </Pressable>
      <Animated.View style={contentStyle}>
        <View style={accordionStyles.content}>{children}</View>
      </Animated.View>
    </View>
  );
}

const accordionStyles = StyleSheet.create({
  item: {
    borderBottomWidth: 1,
  },
  header: {
    borderBottomWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});

const Preferences = () => {
  const muted = useThemeColor("muted");
  const foreground = useThemeColor("foreground");
  const accent = useThemeColor("accent");
  const accentForeground = useThemeColor("accent-foreground");
  const router = useRouter();
  const resetStore = useUserStore((state) => state.resetStore);
  const getPortableBackup = useUserStore((state) => state.getPortableBackup);
  const importPortableBackup = useUserStore((state) => state.importPortableBackup);
  const difficulty = useUserStore((state) => state.difficulty);
  const settings = useUserStore((state) => state.settings);
  const updatePreferences = useUserStore((state) => state.updatePreferences);
  const updateSettings = useUserStore((state) => state.updateSettings);
  const colorMode = useUserStore((state) => state.settings.colorMode);
  const themePalette = useUserStore((state) => state.settings.themePalette);
  const updateColorMode = useUserStore((state) => state.updateColorMode);
  const updateThemePalette = useUserStore((state) => state.updateThemePalette);
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleSection = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  const applyTheme = (mode: ColorMode, palette: ThemePalette) => {
    const effective = getEffectiveTheme(mode, palette);
    Uniwind.setTheme(effective);
  };

  const handleModeSelect = (mode: ColorMode) => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateColorMode(mode);
    const nextPalette =
      mode === 'light' && themePalette === 'dark-pro' ? 'default' : themePalette;
    if (nextPalette !== themePalette) {
      updateThemePalette(nextPalette);
    }
    applyTheme(mode, nextPalette);
  };

  const handlePaletteSelect = (palette: ThemePalette) => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateThemePalette(palette);
    applyTheme(colorMode, palette);
  };

  return (
    <View style={styles.container}>
      <AccordionItem
            id="appearance"
            title="Appearance"
            iconName="paintbrush.fill"
            expanded={expandedIds.has("appearance")}
            onToggle={toggleSection}
            hapticsEnabled={settings.hapticsEnabled}
            foreground={foreground}
            muted={muted}
            accent={accent}
          >
            <View style={styles.themeSection}>
              <ThemedText style={[styles.themeSectionTitle, { color: foreground }]}>
                Theme
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.themeSwatchList}
                style={styles.themeSwatchScroll}
              >
                {PALETTE_OPTIONS.filter(
                  (option) => option.id !== "dark-pro" || colorMode === "dark",
                ).map((option) => (
                  <ThemeSwatch
                    key={option.id}
                    id={option.id}
                    label={option.label}
                    backgroundColor={option.backgroundColor}
                    accentColor={option.accentColor}
                    isActive={themePalette === option.id}
                    borderColor={accent}
                    labelColor={foreground}
                    onPress={() => handlePaletteSelect(option.id)}
                  />
                ))}
              </ScrollView>
            </View>
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
              iconName="speaker.wave.2"
              label="Sound Effects"
              iconColor={accent}
              foreground={foreground}
              muted={muted}
              type="switch"
              switchValue={settings.soundsEnabled}
              onSwitchChange={(val) => updateSettings({ soundsEnabled: val })}
            />
            <PreferenceRow
              iconName="paintbrush.fill"
              label="Appearance"
              iconColor={accent}
              foreground={foreground}
              muted={muted}
              type="switch"
              switchValue={colorMode === "dark"}
              onSwitchChange={(on) => handleModeSelect(on ? "dark" : "light")}
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
          </AccordionItem>

          <AccordionItem
            id="data"
            title="Data & backup"
            iconName="square.and.arrow.up"
            expanded={expandedIds.has("data")}
            onToggle={toggleSection}
            hapticsEnabled={settings.hapticsEnabled}
            foreground={foreground}
            muted={muted}
            accent={accent}
          >
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
          </AccordionItem>

          <AccordionItem
            id="legal"
            title="Legal"
            iconName="doc.text.fill"
            expanded={expandedIds.has("legal")}
            onToggle={toggleSection}
            hapticsEnabled={settings.hapticsEnabled}
            foreground={foreground}
            muted={muted}
            accent={accent}
          >
            <PreferenceRow
              iconName="lock.shield.fill"
              label="Privacy Policy"
              iconColor={accent}
              foreground={foreground}
              muted={muted}
              onPress={() => router.push('/privacy')}
            />
            <PreferenceRow
              iconName="doc.text.fill"
              label="Terms & Conditions"
              iconColor={accent}
              foreground={foreground}
              muted={muted}
              onPress={() => router.push('/terms')}
            />
          </AccordionItem>

          <AccordionItem
            id="account"
            title="Account"
            iconName="person.fill"
            expanded={expandedIds.has("account")}
            onToggle={toggleSection}
            hapticsEnabled={settings.hapticsEnabled}
            foreground={foreground}
            muted={muted}
            accent={accent}
          >
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
          </AccordionItem>
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
  /** When set, rendered on the right instead of value/switch/chevron. Row is not pressable. */
  rightContent?: React.ReactNode;
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
  rightContent,
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

  const isInteractive = rightContent ? false : isSwitch ? !!onSwitchChange : !!onPress;

  const rowContent = (
    <Animated.View style={[styles.row, rightContent ? undefined : animatedStyle]}>
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
        {rightContent !== undefined ? (
          rightContent
        ) : value ? (
          <ThemedText style={[styles.valueText, { color: muted }]}>
            {value}
          </ThemedText>
        ) : null}
        {rightContent === undefined && isSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: muted + "66", true: iconColor + "80" }}
            thumbColor={switchValue ? iconColor : "#f5f5f5"}
          />
        ) : rightContent === undefined && showChevron ? (
          <IconSymbol name="chevron.right" size={16} color={muted} />
        ) : null}
      </View>
    </Animated.View>
  );

  if (rightContent !== undefined) {
    return <View>{rowContent}</View>;
  }

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
      {rowContent}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 32,
    marginBottom: 32,
  },
  themeSection: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  themeSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  themeSwatchScroll: {
    marginHorizontal: -4,
  },
  themeSwatchList: {
    flexDirection: "row",
    gap: 20,
    paddingVertical: 8,
  },
  swatchOuter: {
    alignItems: "center",
    width: 72,
  },
  swatchCircleWrapper: {
    borderRadius: 999,
    padding: 3,
    borderWidth: 0,
    borderColor: "transparent",
    elevation: 4,
  },
  swatchCircleShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  swatchPreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ccc",
  },
  swatchLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 10,
    textAlign: "center",
    maxWidth: 72,
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

