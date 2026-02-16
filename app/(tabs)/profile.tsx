import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';

import Header from '@/components/tabs/profile/header';
import Hero from '@/components/tabs/profile/hero';
import Level from '@/components/tabs/profile/level';
import Stats from '@/components/tabs/profile/stats';
import Badges from '@/components/tabs/profile/badges';
import UpgradeCta from '@/components/tabs/profile/upgrade-cta';
import Preferences from '@/components/tabs/profile/preferences';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import { getUnlockedBadges } from '@/src/utils/badges';
import { useUserStore } from '@/store/userStore';
import { useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Button, Dialog, useThemeColor } from 'heroui-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const scrollY = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const state = useUserStore();
  const shownAchievementBadgeIds = useUserStore((s) => s.shownAchievementBadgeIds);
  const markAchievementBadgesSeen = useUserStore((s) => s.markAchievementBadgesSeen);
  const foreground = useThemeColor('foreground');
  const muted = useThemeColor('muted');
  const accent = useThemeColor('accent');
  const success = useThemeColor('success');
  const isPro = useUserStore((s) => s.isPro);
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
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => confettiRef.current?.start(), 120);
      setTimeout(() => setShowConfetti(false), 2800);
    }
  }, [isFocused, unseenUnlockedBadges, markAchievementBadgesSeen]);

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
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
        <Preferences />
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
});
