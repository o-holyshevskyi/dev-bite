import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { Button, Card, Chip, useThemeColor } from "heroui-native";
import { Alert, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { quizPacks } from "@/src/data/mockData";
import useUserStore from "@/store/userStore";

const RecentPacksCard = () => {
    const accent = useThemeColor('accent');
    const muted = useThemeColor('muted');
    const foreground = useThemeColor('foreground');

    const packProgress = useUserStore((state) => state.packProgress);

    const handleSeeAllPress = () => {
        Alert.alert('See All button pressed');
    }

    const packs = quizPacks.map((pack) => {
        const progressForPack = packProgress.find((p) => p.packId === pack.id);
        const completed = progressForPack?.completedSnippetIds.length ?? 0;
        const total = pack.snippets.length || 1;
        const progress = completed / total;

        let status: 'Not Started' | 'In Progress' | 'Completed' = 'Not Started';
        if (progress >= 1) {
            status = 'Completed';
        } else if (progress > 0) {
            status = 'In Progress';
        }

        return {
            title: pack.title,
            description: pack.description,
            status,
            icon: pack.icon,
            color: pack.color,
            progress,
        };
    });

    return <View style={styles.container}>
        <View style={styles.titleSection}>
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>Continue Learning</ThemedText>
            <Button size="sm" variant="ghost" onPress={handleSeeAllPress}>
                <Button.Label style={{ color: accent, fontWeight: 'bold' }}>See All</Button.Label>
            </Button>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {packs.map((pack, index) => (
                <Card style={[styles.statCard, { backgroundColor: accent + '20', borderWidth: 1, borderColor: accent + '40' }]} key={index}>
                    <Card.Header style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={[styles.stateIconContainer, { backgroundColor: pack.color + '40' }]}>
                            <IconSymbol name={pack.icon as any} size={22} color={pack.color} />
                        </View>
                        <StatusChip
                            status={pack.status}
                            icon={pack.status === 'In Progress' ? 'hourglass' : pack.status === 'Completed' ? 'checkmark.circle.fill' : 'circle'}
                            color={pack.color}
                        />
                    </Card.Header>
                    <Card.Body style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                        <ThemedText style={[styles.statCardTitle, { color: foreground, marginTop: 12 }]}>{pack.title}</ThemedText>
                        <ThemedText numberOfLines={2} style={[styles.stateCardDescription, { color: muted }]}>
                            {pack.description}
                        </ThemedText>
                    </Card.Body>
                    <Card.Footer style={{ marginTop: 12 }}>
                        <View style={{ height: 5, backgroundColor: pack.color + '40', borderRadius: 9999 }}>
                            <View
                                style={{
                                    height: '100%',
                                    width: `${pack.progress * 100}%`,
                                    backgroundColor: pack.color,
                                    borderRadius: 9999,
                                }}
                            />
                        </View>
                    </Card.Footer>
                </Card>
            ))}
        </ScrollView>
    </View>
}

const StatusChip = ({status, icon, color}: {status: string, icon: string, color: string}) => {
    const muted = useThemeColor('muted');

    return (
        <Chip size="lg" style={[styles.statusChip, { height: 32, borderColor: muted + '80', backgroundColor: color + '60' }]}>
            <IconSymbol name={icon as any} size={16} color={color} style={{ marginRight: 2 }} />
            <ThemedText style={[styles.statusChipText, { color: color }]}>{status}</ThemedText>
        </Chip>
    );
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
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 12,
    },
    statCard: {
        flex: 1,
        width: 270,
        height: 180,
    },
    stateIconContainer: {
        padding: 12, 
        borderRadius: 9999,
    },
    statCardTitle: {
        fontSize: 18, 
        fontWeight: '600',
    },
    stateCardDescription: {
        fontSize: 14,
        marginTop: 8,
        lineHeight: 16,
        alignSelf: 'flex-start',
        width: '80%',
    },
    statusChip: {
        alignSelf: 'center',
        borderWidth: 1,
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusChipText: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
});

export default RecentPacksCard;
