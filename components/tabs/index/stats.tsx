import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { quizPacks } from "@/src/data/mockData";
import { getCurrentLevelBounds, getNextRankNameFromLevel } from "@/src/utils/rank";
import useUserStore from "@/store/userStore";
import { useRouter } from "expo-router";
import { Button, Card, useThemeColor } from "heroui-native";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

const Stats = () => {
    const router = useRouter();
    const accent = useThemeColor('accent');
    const muted = useThemeColor('muted');
    const foreground = useThemeColor('foreground');

    const stats = useUserStore((state) => state.stats);
    const packProgress = useUserStore((state) => state.packProgress);
    const rank = useUserStore((state) => state.rank);

    const handleViewHistoryPress = () => {
        router.push('/history');
    }

    const {
        masteryPercent,
        masteredTopicsLabel,
        rankProgressPercent,
        solvedLabel,
        streakLabel,
        accuracyLabel,
        xpToNextLabel,
        levelLabel,
        xpProgressLabel,
        nextRankLabel,
    } = useMemo(() => {
        const packCompletion = quizPacks.map((pack) => {
            const progress = packProgress.find((item) => item.packId === pack.id);
            const completed = progress?.completedSnippetIds.length ?? 0;
            const total = Math.max(1, pack.snippets.length);
            const ratio = completed / total;
            return {
                title: pack.title,
                ratio,
                completed,
                total,
            };
        });

        const totalSnippets = quizPacks.reduce((acc, pack) => acc + pack.snippets.length, 0);
        const completedSnippets = packCompletion.reduce((acc, pack) => {
            return acc + Math.min(pack.completed, pack.total);
        }, 0);

        const masteredPacks = packCompletion
            .filter((pack) => pack.ratio >= 0.7)
            .sort((a, b) => b.ratio - a.ratio)
            .map((pack) => pack.title);

        const masteryPercent = totalSnippets > 0
            ? Math.round((completedSnippets / totalSnippets) * 100)
            : 0;

        const levelBounds = getCurrentLevelBounds(rank.xp);
        const rankProgressPercent = levelBounds.progressPercent;
        const safeAccuracyPercent = Math.max(0, Math.min(100, Math.round(stats.accuracy * 100)));
        const safeSolved = Math.max(0, stats.solved);
        const safeStreak = Math.max(0, stats.streakDays);
        const safeXp = Math.max(0, rank.xp);
        const xpLeft = Math.max(0, levelBounds.levelEndXp - safeXp);
        const nextRankName = getNextRankNameFromLevel(levelBounds.level);
        const nextRankLabel = nextRankName
            ? `Next: ${nextRankName}`
            : 'Top rank reached';

        return {
            masteryPercent,
            masteredTopicsLabel: masteredPacks.length > 0
                ? masteredPacks.join(' | ')
                : 'No solved topics yet',
            rankProgressPercent,
            solvedLabel: `${safeSolved} solved`,
            streakLabel: `${safeStreak} day streak`,
            accuracyLabel: `${safeAccuracyPercent}% accuracy`,
            xpToNextLabel: `${xpLeft} XP to next level`,
            levelLabel: `Level ${levelBounds.level}`,
            xpProgressLabel: `${levelBounds.xpIntoLevel} / ${levelBounds.xpRequiredForLevel} XP`,
            nextRankLabel,
        };
    }, [packProgress, rank.xp, stats.accuracy, stats.solved, stats.streakDays]);

    const data = [
        { value: masteryPercent, color: accent, focused: true },
        { value: Math.max(0, 100 - masteryPercent), color: accent + '60' },
    ];

    return <View style={styles.container}>
        <View style={styles.titleSection}>
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>Your Stats</ThemedText>
            <Button size="sm" variant="ghost" onPress={handleViewHistoryPress}>
                <Button.Label style={{ color: accent, fontWeight: 'bold' }}>View History</Button.Label>
            </Button>
        </View>
        <View style={styles.statSection}>
            <Card style={[styles.statCard, { backgroundColor: accent + '20', borderWidth: 1, borderColor: accent + '40' }]}>
                <Card.Body style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <PieChart 
                        data={data}
                        donut
                        radius={60}
                        innerRadius={48}
                        innerCircleColor={'#00172a'}
                        centerLabelComponent={() => {
                            return (
                            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                <ThemedText style={{fontSize: 22, color: accent, fontWeight: 'bold'}}>
                                    {masteryPercent}%
                                </ThemedText>
                            </View>
                            );
                        }}
                    />
                    <ThemedText style={[styles.statCardTitle, { color: muted, marginTop: 12 }]}>Topic mastered</ThemedText>
                    <ThemedText style={[{ color: accent, textAlign: 'center', fontSize: 14, fontFamily: 'JetBrainsMono_400Regular' }]}>
                        {masteredTopicsLabel}
                    </ThemedText>
                </Card.Body>
            </Card>
            <Card style={[styles.statCard, { backgroundColor: accent + '20', borderWidth: 1, borderColor: accent + '40' }]}>
                <Card.Body style={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <View style={[styles.stateIconContainer, { backgroundColor: accent + '40' }]}>
                        <IconSymbol name="terminal" size={32} color={accent} />
                    </View>
                    <ThemedText style={[styles.statCardTitle, { color: muted }]}>Current Rank</ThemedText>
                    <ThemedText numberOfLines={3} style={[styles.stateCardDescription, { color: foreground }]}>{rank.name}</ThemedText>
                    <ThemedText style={{ color: muted, fontSize: 11, marginTop: 4, textAlign: 'center' }}>
                        {nextRankLabel}
                    </ThemedText>
                    <View style={{ marginTop: 14, width: '100%', paddingHorizontal: 4 }}>
                        <View
                            style={{
                                height: 8,
                                width: '100%',
                                borderRadius: 4,
                                backgroundColor: accent + '40',
                                overflow: 'hidden',
                            }}
                        >
                            <View
                                style={{
                                    height: '100%',
                                    width: `${rankProgressPercent}%`,
                                    backgroundColor: accent,
                                }}
                            />
                        </View>
                    </View>
                    <View style={{ alignSelf: 'stretch' }}>
                        <ThemedText style={{ alignSelf: 'flex-end', color: muted + '90', fontSize: 11 }}>{xpProgressLabel}</ThemedText>
                        <ThemedText style={{ alignSelf: 'flex-end', color: accent, fontSize: 11, marginTop: 2 }}>{xpToNextLabel}</ThemedText>
                    </View>
                    <View style={styles.rankMetaRow}>
                        <ThemedText numberOfLines={1} style={[styles.rankMetaText, { color: muted + '95' }]}>
                            {solvedLabel}
                        </ThemedText>
                        <ThemedText numberOfLines={1} style={[styles.rankMetaText, { color: muted + '95' }]}>
                            {accuracyLabel}
                        </ThemedText>
                    </View>
                </Card.Body>
            </Card>
        </View>
    </View>
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    titleSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statSection: {
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 12,
    },
    statCard: {
        flex: 1,
        minHeight: 290,
    },
    stateIconContainer: {
        padding: 12, 
        borderRadius: 9999, 
        marginBottom: 12
    },
    statCardTitle: {
        fontSize: 14, 
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    stateCardDescription: {
        fontSize: 20,
        marginTop: 8,
        width: '100%',
        alignSelf: 'center',
        textAlign: 'center',
        fontFamily: 'JetBrainsMono_700Bold',
    },
    rankMetaRow: {
        alignSelf: 'stretch',
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    rankMetaText: {
        fontSize: 11,
    },
    rankHeaderRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    rankPill: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        overflow: 'hidden',
    },
});

export default Stats;
