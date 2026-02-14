import { ThemedText } from "@/components/themed-text";
import * as Haptics from "expo-haptics";
import { Card, useThemeColor } from "heroui-native";
import { StyleSheet, View } from "react-native";
import useUserStore from "@/store/userStore";
import { useEffect, useRef } from "react";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";

const Stats = () => {
    const accent = useThemeColor('accent');
    const muted = useThemeColor('muted');
    const foreground = useThemeColor('foreground');

    const stats = useUserStore((state) => state.stats);
    const hapticsEnabled = useUserStore((state) => state.settings.hapticsEnabled);
    const prevStreakRef = useRef(stats.streakDays);
    const hasPlayedInitialStreakAnimationRef = useRef(false);
    const streakScale = useSharedValue(1);
    const streakGlow = useSharedValue(0);
    const flameScale = useSharedValue(1);
    const flameTranslateY = useSharedValue(0);

    const streakAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: streakScale.value }],
        shadowOpacity: streakGlow.value,
    }));
    const flameAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: flameTranslateY.value },
            { scale: flameScale.value },
        ],
    }));

    const triggerStreakVisualCelebration = () => {
        streakScale.value = withSequence(
            withTiming(1.05, { duration: 140 }),
            withSpring(1, { damping: 11, stiffness: 180 }),
        );
        streakGlow.value = withSequence(
            withTiming(0.45, { duration: 140 }),
            withTiming(0, { duration: 380 }),
        );
        flameTranslateY.value = withSequence(
            withTiming(-5, { duration: 110 }),
            withTiming(0, { duration: 180 }),
            withTiming(-2, { duration: 90 }),
            withTiming(0, { duration: 130 }),
        );
        flameScale.value = withSequence(
            withTiming(1.2, { duration: 110 }),
            withTiming(0.95, { duration: 120 }),
            withSpring(1, { damping: 10, stiffness: 190 }),
        );
    };

    useEffect(() => {
        const prev = prevStreakRef.current;
        const next = stats.streakDays;
        prevStreakRef.current = next;

        if (next <= prev) return;

        triggerStreakVisualCelebration();

        if (hapticsEnabled) {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    }, [
        stats.streakDays,
        hapticsEnabled,
        flameScale,
        flameTranslateY,
        streakGlow,
        streakScale,
    ]);

    useEffect(() => {
        if (hasPlayedInitialStreakAnimationRef.current) return;
        if (stats.streakDays <= 0) return;

        hasPlayedInitialStreakAnimationRef.current = true;
        triggerStreakVisualCelebration();
    }, [stats.streakDays]);

    const streakLabel = `${stats.streakDays} Days`;
    const solvedLabel = `${stats.solved} ✅`;
    const accuracyLabel = `${Math.round(stats.accuracy * 100)}% 🎯`;
    const globalRankLabel = `Top ${Math.round(stats.globalRankTopPercent * 100)}% 🏆`;

    return <View style={{ paddingHorizontal: 16, marginTop: 32, flexWrap: 'wrap', flexDirection: 'row', gap: 12 }}>
        <Animated.View style={[styles.statCardWrap, streakAnimatedStyle]}>
            <Card style={[styles.statCard, styles.streakCard, {
                backgroundColor: accent + '20',
                borderWidth: 1,
                borderColor: accent + '40',
                shadowColor: accent,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 0 },
            }]}>
                <Card.Body style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <ThemedText style={[styles.statCardTitle, { color: muted }]}>streak</ThemedText>
                    <View style={styles.streakValueRow}>
                        <ThemedText numberOfLines={1} style={[styles.stateCardDescription, { color: foreground }]}>
                            {streakLabel}
                        </ThemedText>
                        <Animated.Text style={[styles.flameEmoji, flameAnimatedStyle]}>
                            🔥
                        </Animated.Text>
                    </View>
                </Card.Body>
            </Card>
        </Animated.View>
        <Card style={[styles.statCard, { backgroundColor: accent + '20', borderWidth: 1, borderColor: accent + '40' }]}>
            <Card.Body style={{ justifyContent: 'center', alignItems: 'center' }}>
                <ThemedText style={[styles.statCardTitle, { color: muted }]}>solved</ThemedText>
                <ThemedText numberOfLines={1} style={[styles.stateCardDescription, { color: foreground }]}>{solvedLabel}</ThemedText>
            </Card.Body>
        </Card>
        <Card style={[styles.statCard, { backgroundColor: accent + '20', borderWidth: 1, borderColor: accent + '40' }]}>
            <Card.Body style={{ justifyContent: 'center', alignItems: 'center' }}>
                <ThemedText style={[styles.statCardTitle, { color: muted }]}>accuracy</ThemedText>
                <ThemedText numberOfLines={1} style={[styles.stateCardDescription, { color: foreground }]}>{accuracyLabel}</ThemedText>
            </Card.Body>
        </Card>
        <Card style={[styles.statCard, { backgroundColor: accent + '20', borderWidth: 1, borderColor: accent + '40' }]}>
            <Card.Body style={{ justifyContent: 'center', alignItems: 'center' }}>
                <ThemedText style={[styles.statCardTitle, { color: muted }]}>global rank</ThemedText>
                <ThemedText numberOfLines={1} style={[styles.stateCardDescription, { color: foreground }]}>{globalRankLabel}</ThemedText>
            </Card.Body>
        </Card>
    </View>
}

const styles = StyleSheet.create({
    statCardWrap: {
        width: '48%',
    },
    statCard: {
        width: '48%',
        alignItems: 'flex-start',
    },
    streakCard: {
        width: '100%',
    },
    statCardTitle: {
        fontSize: 14, 
        fontWeight: '600',
        textTransform: 'uppercase',
        alignSelf: 'flex-start'
    },
    stateCardDescription: {
        fontSize: 22,
        marginTop: 8,
        fontWeight: 'bold',
        alignSelf: 'flex-start'
    },
    streakValueRow: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
    },
    flameEmoji: {
        fontSize: 22,
        lineHeight: 24,
    }
});

export default Stats;
