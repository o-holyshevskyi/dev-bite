import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { getLeaderboard } from "@/src/utils/leaderboard";
import useUserStore, { getStreakStatus } from "@/store/userStore";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Chip, useThemeColor } from "heroui-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";

const Header = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const profile = useUserStore((state) => state.profile);
    const router = useRouter();
    const userXp = useUserStore((state) => state.rank.xp);
    const globalRank = useMemo(() => {
        const entry = getLeaderboard(userXp).find((item) => item.isUser);
        return entry?.rank ?? 0;
    }, [userXp]);

    const [date, setDate] = useState<string>('');

    useEffect(() => {
        const currentDate = new Date();
        const formattedDate = format(currentDate, 'EEEE, MMM dd');
        setDate(formattedDate);
    }, []);

    return (
        <View style={[styles.headerContainer, { borderBottomColor: muted + '60', borderBottomWidth: 1 }]}>
            <View>
                <ThemedText style={[styles.headerDateText, { color: muted }]}>{date}</ThemedText>
                <ThemedText style={[styles.headerGreetingText, { color: foreground }]}>Good Morning, {profile.name}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Pressable
                    onPress={() => router.push('/leaderboard')}
                    hitSlop={8}
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.88 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                >
                    <GlobalRankChip rank={globalRank} />
                </Pressable>
                <StreakChip />
            </View>
        </View>
    );
}

const GlobalRankChip = ({ rank }: { rank: number }) => {
    const accent = useThemeColor('accent');
    const muted = useThemeColor('muted');
    return (
        <View
            style={[
                styles.globalRankChip,
                {
                    borderColor: accent + '88',
                    backgroundColor: accent + '24',
                },
            ]}
        >
            <IconSymbol name="trophy.fill" size={15} color={accent} style={{ marginRight: 4 }} />
            <ThemedText style={[styles.globalRankChipText, { color: rank > 0 ? accent : muted }]}>
                {rank > 0 ? `#${rank}` : '--'}
            </ThemedText>
        </View>
    );
}

export const StreakChip = () => {
    const accent = useThemeColor('accent');
    const muted = useThemeColor('muted');
    const streakDays = useUserStore((state) => state.stats.streakDays);
    const lastCompletedDate = useUserStore((state) => state.dailyState.lastCompletedDate);
    const hapticsEnabled = useUserStore((state) => state.settings.hapticsEnabled);
    const prevStreakRef = useRef(streakDays);
    const hasPlayedInitialAnimationRef = useRef(false);
    const chipScale = useSharedValue(1);
    const flameScale = useSharedValue(1);
    const flameTranslateY = useSharedValue(0);
    const safeStreakDays = Math.max(0, streakDays);
    const streakStatus = getStreakStatus(safeStreakDays, lastCompletedDate);
    const chipAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: chipScale.value }],
    }));
    const flameAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: flameTranslateY.value },
            { scale: flameScale.value },
        ],
    }));

    const triggerStreakAnimation = () => {
        chipScale.value = withSequence(
            withTiming(1.06, { duration: 130 }),
            withSpring(1, { damping: 11, stiffness: 180 }),
        );
        flameTranslateY.value = withSequence(
            withTiming(-5, { duration: 110 }),
            withTiming(0, { duration: 180 }),
            withTiming(-2, { duration: 90 }),
            withTiming(0, { duration: 130 }),
        );
        flameScale.value = withSequence(
            withTiming(1.18, { duration: 110 }),
            withTiming(0.95, { duration: 120 }),
            withSpring(1, { damping: 10, stiffness: 190 }),
        );
    };

    useEffect(() => {
        const prev = prevStreakRef.current;
        const next = safeStreakDays;
        prevStreakRef.current = next;
        if (next <= prev) return;

        triggerStreakAnimation();
        if (hapticsEnabled) {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    }, [hapticsEnabled, safeStreakDays]);

    useEffect(() => {
        if (hasPlayedInitialAnimationRef.current) return;
        if (safeStreakDays <= 0) return;

        hasPlayedInitialAnimationRef.current = true;
        triggerStreakAnimation();
    }, [safeStreakDays]);

    const iconColor =
        streakStatus === 'safe'
            ? '#FF9F0A'
            : streakStatus === 'atRisk'
                ? muted + 'CC'
                : muted + '66';
    const chipOpacity = streakStatus === 'safe' ? 1 : streakStatus === 'atRisk' ? 0.85 : 0.6;
    const chipBackground =
        streakStatus === 'safe'
            ? accent + '70'
            : streakStatus === 'atRisk'
                ? muted + '30'
                : muted + '18';
    const chipBorder =
        streakStatus === 'safe'
            ? accent + '99'
            : streakStatus === 'atRisk'
                ? muted + '88'
                : muted + '55';
    const labelColor = streakStatus === 'safe' ? accent : muted + 'D0';

    return (
        <Animated.View style={chipAnimatedStyle}>
            <Chip
                size="lg"
                style={[
                    styles.streakChip,
                    {
                        height: 32,
                        borderColor: chipBorder,
                        backgroundColor: chipBackground,
                        opacity: chipOpacity,
                    },
                ]}
            >
                <Animated.View style={[styles.flameWrap, flameAnimatedStyle]}>
                    <IconSymbol name="flame" size={18} color={iconColor} style={{ marginRight: 2 }} />
                </Animated.View>
                <ThemedText style={[styles.streakChipText, { color: labelColor }]}>{safeStreakDays}</ThemedText>
            </Chip>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerDateText: {
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    headerGreetingText: {
        fontSize: 24,
        fontWeight: '800',
        marginTop: 4,
    },
    streakChip: {
        alignSelf: 'center',
        borderWidth: 1,
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    globalRankChip: {
        alignSelf: 'center',
        borderWidth: 1,
        paddingHorizontal: 8,
        height: 32,
        flexDirection: 'row',
        alignItems: 'center',
    },
    globalRankChipText: {
        fontSize: 13,
        fontWeight: '800',
    },
    streakChipText: {
        fontSize: 14,
        fontWeight: '800',
    },
    flameWrap: {
        marginRight: 2,
    },
});

export default Header;