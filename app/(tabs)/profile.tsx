import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';

import Header from '@/components/tabs/profile/header';
import Hero from '@/components/tabs/profile/hero';
import Level from '@/components/tabs/profile/level';
import Stats from '@/components/tabs/profile/stats';
import Badges from '@/components/tabs/profile/badges';
import UpgradeCta from '@/components/tabs/profile/upgrade-cta';
import LeaderboardEntry from '@/components/tabs/profile/leaderboard-entry';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import { getUnlockedBadges } from '@/src/utils/badges';
import { quizPacks } from '@/src/data/mockData';
import { useUserStore } from '@/store/userStore';
import { useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Button, Dialog, useThemeColor } from 'heroui-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const scrollY = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const state = useUserStore();
  const shownAchievementBadgeIds = useUserStore((s) => s.shownAchievementBadgeIds);
  const markAchievementBadgesSeen = useUserStore((s) => s.markAchievementBadgesSeen);
  const background = useThemeColor('background');
  const foreground = useThemeColor('foreground');
  const muted = useThemeColor('muted');
  const accent = useThemeColor('accent');
  const success = useThemeColor('success');
  const warning = useThemeColor('warning');
  const isPro = useUserStore((s) => s.isPro);
  const getCategoryProgress = useUserStore((s) => s.getCategoryProgress);
  const masteryInsight = useUserStore((s) => s.masteryInsight);
  const hapticsEnabled = useUserStore((s) => s.settings.hapticsEnabled);
  const [isAchievementDialogOpen, setIsAchievementDialogOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [dialogBadges, setDialogBadges] = useState<typeof unlockedBadges>([]);
  const hasShownThisFocusRef = useRef(false);
  const confettiRef = useRef<ConfettiCannon>(null);
  const unlockedBadges = useMemo(() => getUnlockedBadges(state), [state]);
  const unseenUnlockedBadges = useMemo(
    () =>
      unlockedBadges.filter(
        (badge) => !(shownAchievementBadgeIds ?? []).includes(badge.id),
      ),
    [unlockedBadges, shownAchievementBadgeIds],
  );
  const pathSummary = useMemo(() => {
    const seen = new Set<string>();
    const categories: { category: string; progress: number }[] = [];

    for (const pack of quizPacks) {
      const key = (pack.category ?? '').trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      categories.push({
        category: pack.category ?? pack.language,
        progress: getCategoryProgress(pack.category ?? pack.language),
      });
    }

    const mastered = categories.filter((item) => item.progress >= 100).map((item) => item.category);
    return { categories, mastered };
  }, [getCategoryProgress]);

  const HEADER_HEIGHT = 60 + insets.top; 

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 80], [1, 0], Extrapolation.CLAMP);
    
    const translateY = interpolate(scrollY.value, [0, 80], [0, -HEADER_HEIGHT], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  useEffect(() => {
    if (!isFocused) {
      hasShownThisFocusRef.current = false;
      setIsAchievementDialogOpen(false);
      return;
    }

    if (unseenUnlockedBadges.length > 0 && !hasShownThisFocusRef.current) {
      setDialogBadges(unseenUnlockedBadges);
      setIsAchievementDialogOpen(true);
      hasShownThisFocusRef.current = true;
      markAchievementBadgesSeen(unseenUnlockedBadges.map((badge) => badge.id));
      setShowConfetti(true);
      if (hapticsEnabled) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setTimeout(() => confettiRef.current?.start(), 120);
      setTimeout(() => setShowConfetti(false), 2800);
    }
  }, [isFocused, unseenUnlockedBadges, markAchievementBadgesSeen, hapticsEnabled]);

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <View style={[styles.headerContainer, { height: HEADER_HEIGHT }]} pointerEvents="box-none">
        <Animated.View style={[styles.animatedHeader, headerAnimatedStyle]}>
          <View style={{ paddingTop: insets.top }}>
            <Header />
          </View>
        </Animated.View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + 20, paddingBottom: 80 }}
      >
        <Hero />
        <Level />
        <Stats />
        <View style={[styles.pathSummaryCard, { borderColor: accent + '35', backgroundColor: accent + '12' }]}>
          <View style={styles.pathSummaryHeader}>
            <View style={styles.pathSummaryTitleRow}>
              <IconSymbol name="map.fill" size={18} color={accent} />
              <ThemedText style={[styles.pathSummaryTitle, { color: foreground }]}>
                Learning Path
              </ThemedText>
            </View>
            <Pressable onPress={() => router.push('/(tabs)/path')}>
              <ThemedText style={[styles.pathSummaryLink, { color: accent }]}>Open</ThemedText>
            </Pressable>
          </View>

          <ThemedText style={[styles.pathSummarySubtitle, { color: muted }]}>
            {pathSummary.mastered.length > 0
              ? `Mastered: ${pathSummary.mastered.join(', ')}`
              : 'No technologies mastered yet. Keep building streaks.'}
          </ThemedText>

          <View style={styles.pathSummaryList}>
            {pathSummary.categories.map((item) => (
              <View key={item.category} style={styles.pathSummaryRow}>
                <ThemedText style={[styles.pathSummaryCategory, { color: foreground }]}>
                  {item.category}
                </ThemedText>
                <View style={[styles.pathSummaryTrack, { backgroundColor: muted + '2e' }]}>
                  <View
                    style={[
                      styles.pathSummaryFill,
                      {
                        width: `${Math.max(0, Math.min(100, item.progress))}%`,
                        backgroundColor: item.progress >= 100 ? success : warning,
                      },
                    ]}
                  />
                </View>
                <ThemedText style={[styles.pathSummaryPercent, { color: muted }]}>
                  {Math.round(item.progress)}%
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
        <View style={[styles.insightCard, { borderColor: warning + '38', backgroundColor: warning + '12' }]}>
          <View style={styles.insightHeaderRow}>
            <View style={styles.insightTitleRow}>
              <IconSymbol name="brain.head.profile" size={18} color={warning} />
              <ThemedText style={[styles.insightTitle, { color: foreground }]}>
                Mastery Insight
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.insightText, { color: muted }]}>
            {masteryInsight.summary}
          </ThemedText>
        </View>
        <Badges />
        {isPro ? (
          <View style={[styles.proBadgeRow, { borderColor: success + '40', backgroundColor: success + '14' }]}>
            <IconSymbol name="checkmark.seal.fill" size={16} color={success} />
            <ThemedText style={[styles.proBadgeText, { color: foreground }]}>
              You are a PRO member
            </ThemedText>
          </View>
        ) : (
          <UpgradeCta />
        )}
        <LeaderboardEntry />
      </Animated.ScrollView>

      <Dialog isOpen={isAchievementDialogOpen} onOpenChange={setIsAchievementDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <View style={styles.dialogHeader}>
              <Dialog.Title style={[styles.dialogTitle, { color: foreground }]}>
                Achievements Reached
              </Dialog.Title>
              <Dialog.Description style={[styles.dialogSubtitle, { color: muted }]}>
                {`You unlocked ${dialogBadges.length} new badge${dialogBadges.length === 1 ? '' : 's'}.`}
              </Dialog.Description>
            </View>

            <ScrollView
              style={styles.badgeList}
              contentContainerStyle={styles.badgeListContent}
              showsVerticalScrollIndicator={false}
            >
              {dialogBadges.map((badge) => (
                <View key={badge.id} style={[styles.badgeRow, { borderColor: accent + '30' }]}>
                  <View style={[styles.badgeIconWrap, { backgroundColor: badge.background, borderColor: badge.border }]}>
                    <IconSymbol name={badge.iconName as any} size={14} color={badge.iconColor} />
                  </View>
                  <View style={styles.badgeTextWrap}>
                    <ThemedText style={[styles.badgeName, { color: foreground }]}>
                      {badge.title}
                    </ThemedText>
                    <ThemedText style={[styles.badgeDescription, { color: muted }]}>
                      {badge.description}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </ScrollView>

            <Button onPress={() => setIsAchievementDialogOpen(false)}>
              <Button.Label>Nice</Button.Label>
            </Button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={120}
          origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
          fadeOut
          autoStart={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  animatedHeader: {
    width: '100%',
    height: '100%',
  },
  dialogHeader: {
    marginBottom: 10,
  },
  dialogTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  dialogSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  badgeList: {
    marginBottom: 14,
    maxHeight: 260,
  },
  badgeListContent: {
    gap: 8,
  },
  badgeRow: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgeIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTextWrap: {
    flex: 1,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700',
  },
  badgeDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  proBadgeRow: {
    marginTop: 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  proBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pathSummaryCard: {
    marginTop: 22,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  pathSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pathSummaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pathSummaryTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  pathSummaryLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  pathSummarySubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  pathSummaryList: {
    gap: 8,
  },
  pathSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pathSummaryCategory: {
    width: 86,
    fontSize: 12,
    fontWeight: '700',
  },
  pathSummaryTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  pathSummaryFill: {
    height: '100%',
    borderRadius: 999,
  },
  pathSummaryPercent: {
    width: 38,
    textAlign: 'right',
    fontSize: 11,
    fontFamily: 'JetBrainsMono_700Bold',
  },
  insightCard: {
    marginTop: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  insightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  insightText: {
    fontSize: 13,
    lineHeight: 19,
  },
});
