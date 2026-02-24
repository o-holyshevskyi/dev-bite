import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import { useRouter } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const background = useThemeColor('background');
  const foreground = useThemeColor('foreground');
  const muted = useThemeColor('muted');

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={foreground} />
          <ThemedText style={[styles.backText, { color: foreground }]}>Back</ThemedText>
        </Pressable>
        <ThemedText style={[styles.topBarTitle, { color: foreground }]}>Privacy Policy</ThemedText>
        <View style={styles.rightSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={[styles.intro, { color: muted }]}>
          DevBite respects your privacy. This policy describes what data we collect and how we use it.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: foreground }]}>
          Information we collect
        </ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>
          We collect progress data stored locally on your device, including quiz results, streaks,
          and preferences. If you enable notifications, we use your device to send reminders. We do
          not collect personal identification unless you optionally set a display name or avatar.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: foreground }]}>
          How we use data
        </ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>
          Your data is used to provide the learning experience, show your progress and stats, and
          personalize reminders. We do not sell or share your data with third parties for marketing.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: foreground }]}>
          Data retention
        </ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>
          Progress and settings are stored on your device. If you export a backup, you control that
          file. Deleting the app or logging out removes local data from the device.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: foreground }]}>
          Your rights
        </ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>
          You can export your data from the profile settings at any time. You may disable
          notifications, haptics, and other options in Preferences. Contact us if you have
          questions about your data.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: foreground }]}>
          Contact
        </ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>
          For privacy-related questions, please reach out through the app support or the contact
          details provided in the app store listing.
        </ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 84,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  rightSpacer: {
    width: 84,
    height: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  intro: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
});
