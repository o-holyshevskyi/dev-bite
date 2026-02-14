import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import useUserStore, { getStreakStatus } from "@/store/userStore";
import { format } from "date-fns";
import { Chip, useThemeColor } from "heroui-native";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

const Header = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const profile = useUserStore((state) => state.profile);

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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <StreakChip />
            </View>
        </View>
    );
}

export const StreakChip = () => {
    const accent = useThemeColor('accent');
    const muted = useThemeColor('muted');
    const streakDays = useUserStore((state) => state.stats.streakDays);
    const lastCompletedDate = useUserStore((state) => state.dailyState.lastCompletedDate);
    const safeStreakDays = Math.max(0, streakDays);
    const streakStatus = getStreakStatus(safeStreakDays, lastCompletedDate);

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
            <IconSymbol name="flame" size={18} color={iconColor} style={{ marginRight: 2 }} />
            <ThemedText style={[styles.streakChipText, { color: labelColor }]}>{safeStreakDays}</ThemedText>
        </Chip>
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
    streakChipText: {
        fontSize: 14,
        fontWeight: '800',
    },
});

export default Header;