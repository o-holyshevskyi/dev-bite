import { ThemedText } from "@/components/themed-text";
import { Card, useThemeColor } from "heroui-native";
import { StyleSheet, View } from "react-native";
import useUserStore from "@/store/userStore";

const Stats = () => {
    const accent = useThemeColor('accent');
    const muted = useThemeColor('muted');
    const foreground = useThemeColor('foreground');

    const stats = useUserStore((state) => state.stats);

    const streakLabel = `${stats.streakDays} Days 🔥`;
    const solvedLabel = `${stats.solved} ✅`;
    const accuracyLabel = `${Math.round(stats.accuracy * 100)}% 🎯`;
    const globalRankLabel = `Top ${Math.round(stats.globalRankTopPercent * 100)}% 🏆`;

    return <View style={{ paddingHorizontal: 16, marginTop: 32, flexWrap: 'wrap', flexDirection: 'row', gap: 12 }}>
        <Card style={[styles.statCard, { backgroundColor: accent + '20', borderWidth: 1, borderColor: accent + '40' }]}>
            <Card.Body style={{ justifyContent: 'center', alignItems: 'center' }}>
                <ThemedText style={[styles.statCardTitle, { color: muted }]}>streak</ThemedText>
                <ThemedText numberOfLines={1} style={[styles.stateCardDescription, { color: foreground }]}>{streakLabel}</ThemedText>
            </Card.Body>
        </Card>
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
    statCard: {
        width: '48%',
        alignItems: 'flex-start'
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
    }
});

export default Stats;
