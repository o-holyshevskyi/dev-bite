import { ThemedText } from "@/components/themed-text";
import {
    getCurrentLevelBounds,
    getMaxRankTitleLevel,
    getNextRankNameFromLevel,
    getRankNameFromLevel,
} from "@/src/utils/rank";
import useUserStore from "@/store/userStore";
import { Card, useThemeColor } from "heroui-native";
import { View } from "react-native";

const Level = () => {
    const accent = useThemeColor('accent');
    const muted = useThemeColor('muted');
    const rank = useUserStore((state) => state.rank);
    const bounds = getCurrentLevelBounds(rank.xp);
    const currentRankName = getRankNameFromLevel(bounds.level);
    const nextRankName = getNextRankNameFromLevel(bounds.level);

    const levelLabel = `Level ${bounds.level}`;
    const xpLabel = `${bounds.xpIntoLevel} / ${bounds.xpRequiredForLevel} xp`;
    const progressPercent = bounds.progressPercent;
    const nextLabel = nextRankName
        ? `Next: ${nextRankName} (Level ${Math.min(getMaxRankTitleLevel(), bounds.level + 1)})`
        : 'Top rank reached';

    return <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
        <Card
            style={{ backgroundColor: accent + '20', borderWidth: 1, borderColor: accent + '40', borderRadius: 25 }}        
        >
            <Card.Header 
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <ThemedText style={{ color: muted, textTransform: 'uppercase' }}>{levelLabel}</ThemedText>
                <ThemedText style={{ color: muted, textTransform: 'uppercase' }}>{xpLabel}</ThemedText>
            </Card.Header>
            <Card.Body>
                <ThemedText style={{ color: accent, fontWeight: '700', textAlign: 'center' }}>
                    {currentRankName}
                </ThemedText>
                <ThemedText style={{ color: muted, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                    {nextLabel}
                </ThemedText>
                <View style={{ marginTop: 16, width: '100%', paddingHorizontal: 16 }}>
                    <View
                        style={{
                            height: 12,
                            width: '100%',
                            borderRadius: 999,
                            backgroundColor: accent + '40',
                            overflow: 'hidden',
                        }}
                    >
                        <View
                            style={{
                                height: '100%',
                                width: `${progressPercent}%`,
                                backgroundColor: accent,
                            }}
                        />
                    </View>
                </View>
            </Card.Body>
        </Card>
    </View>
}

export default Level;
