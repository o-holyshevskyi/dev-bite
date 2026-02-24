import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import { useRouter } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TermsScreen() {
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
        <ThemedText style={[styles.topBarTitle, { color: foreground }]}>
          Terms & Conditions
        </ThemedText>
        <View style={styles.rightSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={[styles.intro, { color: muted }]}>
          By using DevBite you agree to these terms. Please read them carefully.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: foreground }]}>
          Acceptance
        </ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>
          Using the app constitutes acceptance of these Terms & Conditions. If you do not agree,
          do not use the app.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: foreground }]}>
          Use of the app
        </ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>
          DevBite is provided for personal learning and practice. You may use the content and
          features for non-commercial purposes in accordance with these terms.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: foreground }]}>
          Pro subscription
        </ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>
          Pro features may be offered via in-app purchase. Payment and subscription terms are
          governed by the platform (Apple App Store or Google Play). Cancellation and refunds
          follow the platform’s policies.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: foreground }]}>
          Acceptable use
        </ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>
          You may not reverse-engineer, redistribute, or misuse the app or its content. Do not
          attempt to circumvent access controls or use the service for any illegal purpose.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: foreground }]}>
          Limitation of liability
        </ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>
          The app is provided “as is.” We are not liable for any indirect, incidental, or
          consequential damages arising from your use of the app. Our liability is limited to the
          extent permitted by law.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: foreground }]}>
          Changes
        </ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>
          We may update these terms from time to time. Continued use of the app after changes
          constitutes acceptance of the updated terms. We encourage you to review this page
          periodically.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: foreground }]}>
          Contact
        </ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>
          For questions about these terms, please contact us through the app support or the
          contact details provided in the app store listing.
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
