import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import useUserStore from "@/store/userStore";
import { useRouter } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

type ProFeature = {
  id: string;
  label: string;
  icon: Parameters<typeof IconSymbol>[0]["name"];
};

const PRO_FEATURES: ProFeature[] = [
  {
    id: "premium-snippets",
    label: "Unlock 500+ Premium Snippets",
    icon: "sparkles",
  },
  {
    id: "no-ads",
    label: "No Ads, Ever",
    icon: "nosign",
  },
  {
    id: "advanced-insights",
    label: "Advanced Statistics & Insights",
    icon: "chart.line.uptrend.xyaxis",
  },
  {
    id: "grandmaster-badges",
    label: "Exclusive 'Grandmaster' Badges",
    icon: "medal.star.fill",
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const unlockPro = useUserStore((state) => state.unlockPro);
  const isPro = useUserStore((state) => state.isPro);
  const [pendingAction, setPendingAction] = useState<"purchase" | "restore" | null>(
    null,
  );

  const background = useThemeColor("background");
  const foreground = useThemeColor("foreground");
  const muted = useThemeColor("muted");
  const accent = useThemeColor("accent");
  const success = useThemeColor("success");
  const warning = useThemeColor("warning");

  const proGradientTone = useMemo(() => `${warning}1f`, [warning]);
  const isLoading = pendingAction !== null;
  const isRestoring = pendingAction === "restore";

  const completeUpgradeAndClose = (message: string) => {
    unlockPro();
    setPendingAction(null);
    Alert.alert(message);
    router.back();
  };

  const handleUnlockPro = () => {
    if (isLoading) return;
    if (isPro) {
      router.back();
      return;
    }

    setPendingAction("purchase");

    setTimeout(() => {
      completeUpgradeAndClose("Welcome to Pro! 🎉");
    }, 1500);
  };

  const handleRestorePurchases = () => {
    if (isLoading) return;

    setPendingAction("restore");

    setTimeout(() => {
      completeUpgradeAndClose(
        isPro ? "Your Pro access is already active." : "Purchases restored! Welcome back to Pro! 🎉",
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: "#06070d" }]}>
      <View style={styles.container}>
        <View
          style={[
            styles.glowOrbTop,
            {
              backgroundColor: `${accent}1f`,
            },
          ]}
        />
        <View
          style={[
            styles.glowOrbBottom,
            {
              backgroundColor: `${warning}24`,
            },
          ]}
        />

        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.closeButton, { backgroundColor: `${foreground}14` }]}
          >
            <IconSymbol name="xmark" size={20} color={foreground} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleWrap}>
            <ThemedText style={[styles.proTitle, { color: foreground }]}>
              DevBite PRO
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: muted }]}>
              Unlock every pack and accelerate your growth.
            </ThemedText>
          </View>

          <View style={[styles.heroCard, { backgroundColor: proGradientTone }]}>
            <View style={[styles.heroBadge, { backgroundColor: `${warning}30` }]}>
              <IconSymbol name="trophy.fill" size={48} color={warning} />
            </View>
            <ThemedText style={[styles.heroHeading, { color: foreground }]}>
              Built for ambitious developers
            </ThemedText>
            <ThemedText style={[styles.heroDescription, { color: muted }]}>
              Go beyond the basics with premium challenges, deep insights, and elite badges.
            </ThemedText>
          </View>

          <View style={styles.features}>
            {PRO_FEATURES.map((feature) => (
              <View
                key={feature.id}
                style={[styles.featureRow, { borderColor: `${foreground}1f` }]}
              >
                <View style={[styles.featureIconWrap, { backgroundColor: `${accent}20` }]}>
                  <IconSymbol name={feature.icon} size={18} color={accent} />
                </View>
                <ThemedText style={[styles.featureText, { color: foreground }]}>
                  {feature.label}
                </ThemedText>
              </View>
            ))}
          </View>

          <View style={[styles.planCard, { backgroundColor: background }]}>
            <View style={[styles.bestValueBadge, { backgroundColor: `${success}24` }]}>
              <ThemedText style={[styles.bestValueText, { color: success }]}>
                Best Value
              </ThemedText>
            </View>
            <ThemedText style={[styles.planTitle, { color: foreground }]}>
              Yearly Plan
            </ThemedText>
            <ThemedText style={[styles.planPrice, { color: foreground }]}>
              $19.99/year
            </ThemedText>
            <ThemedText style={[styles.planMeta, { color: muted }]}>
              Less than $1.70/month for full Pro access.
            </ThemedText>
          </View>
        </ScrollView>

        <Button
          size="lg"
          isDisabled={isLoading}
          style={[
            styles.ctaButton,
            {
              backgroundColor: accent,
            },
          ]}
          onPress={handleUnlockPro}
        >
          <View style={styles.ctaInner}>
            {isLoading && !isRestoring ? (
              <>
                <ActivityIndicator size="small" color={background} />
                <ThemedText style={[styles.ctaText, { color: background }]}>
                  Processing...
                </ThemedText>
              </>
            ) : (
              <ThemedText style={[styles.ctaText, { color: background }]}>
                Unlock Pro Access — $19.99/year
              </ThemedText>
            )}
          </View>
        </Button>
        <Pressable
          onPress={handleRestorePurchases}
          disabled={isLoading}
          style={styles.restoreButton}
        >
          {isRestoring ? (
            <View style={styles.restoreLoading}>
              <ActivityIndicator size="small" color={muted} />
              <ThemedText style={[styles.restoreText, { color: muted }]}>
                Restoring purchases...
              </ThemedText>
            </View>
          ) : (
            <ThemedText style={[styles.restoreText, { color: muted }]}>
              Restore Purchases
            </ThemedText>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
    overflow: "hidden",
  },
  glowOrbTop: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 999,
    top: -80,
    right: -70,
  },
  glowOrbBottom: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 999,
    bottom: -120,
    left: -90,
  },
  header: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    gap: 14,
    paddingBottom: 8,
  },
  titleWrap: {
    gap: 4,
  },
  proTitle: {
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: 0.8,
    fontWeight: "900",
    textShadowColor: "rgba(255, 207, 89, 0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  heroCard: {
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    gap: 8,
  },
  heroBadge: {
    width: 86,
    height: 86,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  heroHeading: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  heroDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  features: {
    gap: 8,
  },
  featureRow: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  planCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 4,
  },
  bestValueBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 4,
  },
  bestValueText: {
    fontSize: 12,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    fontWeight: "800",
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  planPrice: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
  },
  planMeta: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  ctaButton: {
    height: 62,
    borderRadius: 16,
    marginTop: 14,
  },
  restoreButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    minHeight: 28,
  },
  ctaInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  restoreLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  restoreText: {
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

