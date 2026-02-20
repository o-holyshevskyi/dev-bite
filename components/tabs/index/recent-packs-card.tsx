import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { useRouter } from "expo-router";
import { Button, Card, Chip, useThemeColor } from "heroui-native";
import { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from "react-native-reanimated";
import { getContrastSafePackColor } from "@/src/utils/color";
import { getCurrentLearningPacks } from "@/src/utils/learning-path";
import useUserStore from "@/store/userStore";
import { useUniwind } from "uniwind";

const RecentPacksCard = () => {
    const router = useRouter();
    const accent = useThemeColor('accent');
    const muted = useThemeColor('muted');
    const foreground = useThemeColor('foreground');

    const packProgress = useUserStore((state) => state.packProgress);

    const handleSeeAllPress = () => {
        router.push('/(tabs)/explore');
    }

    const currentLearningPacks = getCurrentLearningPacks(packProgress);
    const packs = currentLearningPacks.map((pack) => {
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
            id: pack.id,
            title: pack.title,
            description: pack.description,
            status,
            icon: pack.icon,
            color: pack.color,
            progress,
        };
    });

    const inProgressPacks = packs
        .filter((pack) => pack.status === 'In Progress')
        .sort((a, b) => b.progress - a.progress);

    const notStartedPacks = packs
        .filter((pack) => pack.status === 'Not Started');

    const hasStartedAnyPack = packs.some((pack) => pack.progress > 0);
    const title = hasStartedAnyPack ? 'Continue Learning' : 'Explore New';
    const visiblePacks = (
        hasStartedAnyPack
            ? (inProgressPacks.length > 0 ? inProgressPacks : notStartedPacks)
            : notStartedPacks
    )
        .slice(0, 5);

    const handlePackPress = (packId: string) => {
        router.push({
            pathname: '/pack/[id]',
            params: { id: packId },
        } as never);
    };

    return <View style={styles.container}>
        <View style={styles.titleSection}>
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>{title}</ThemedText>
            <Button size="sm" variant="ghost" onPress={handleSeeAllPress}>
                <Button.Label style={{ color: accent, fontWeight: 'bold' }}>See All</Button.Label>
            </Button>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {visiblePacks.map((pack) => (
                <PackItemCard
                    key={pack.id}
                    pack={pack}
                    accent={accent}
                    muted={muted}
                    foreground={foreground}
                    onPress={handlePackPress}
                />
            ))}
        </ScrollView>
    </View>
}

type PackItem = {
    id: string;
    title: string;
    description: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    icon: string;
    color: string;
    progress: number;
};

const isLightTheme = (theme: string) =>
    theme === 'light' || theme === 'ocean-light' || theme === 'mint-light';

const PackItemCard = ({
    pack,
    accent,
    muted,
    foreground,
    onPress,
}: {
    pack: PackItem;
    accent: string;
    muted: string;
    foreground: string;
    onPress: (packId: string) => void;
}) => {
    const { theme } = useUniwind();
    const packColor = useMemo(
        () => getContrastSafePackColor(pack.color, isLightTheme(theme)),
        [pack.color, theme],
    );
    const pressScale = useSharedValue(1);
    const progressWidth = useSharedValue(0);

    useEffect(() => {
        progressWidth.value = withTiming(pack.progress * 100, {
            duration: 800,
            easing: Easing.out(Easing.exp),
        });
    }, [pack.progress, progressWidth]);

    const pressAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pressScale.value }],
    }));

    const progressAnimatedStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value}%`,
    }));

    const handlePressIn = () => {
        pressScale.value = withTiming(0.97, { duration: 120 });
    };

    const handlePressOut = () => {
        pressScale.value = withSpring(1, {
            damping: 14,
            stiffness: 220,
            mass: 0.7,
        });
    };

    return (
        <Pressable onPress={() => onPress(pack.id)} onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View style={pressAnimatedStyle}>
                <Card style={[styles.statCard, { backgroundColor: accent + '20', borderWidth: 1, borderColor: accent + '40' }]}>
                    <Card.Header style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={[styles.stateIconContainer, { backgroundColor: packColor + '40' }]}>
                            <IconSymbol name={pack.icon as any} size={22} color={packColor} />
                        </View>
                        <StatusChip
                            status={pack.status}
                            icon={pack.status === 'In Progress' ? 'hourglass' : pack.status === 'Completed' ? 'checkmark.circle.fill' : 'circle'}
                            color={packColor}
                        />
                    </Card.Header>
                    <Card.Body style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                        <ThemedText style={[styles.statCardTitle, { color: foreground, marginTop: 12 }]}>{pack.title}</ThemedText>
                        <ThemedText numberOfLines={2} style={[styles.stateCardDescription, { color: muted }]}>
                            {pack.description}
                        </ThemedText>
                    </Card.Body>
                    <Card.Footer style={{ marginTop: 12 }}>
                        <View style={{ height: 5, backgroundColor: packColor + '40', borderRadius: 9999 }}>
                            <Animated.View
                                style={[
                                    {
                                        height: '100%',
                                        backgroundColor: packColor,
                                        borderRadius: 9999,
                                    },
                                    progressAnimatedStyle,
                                ]}
                            />
                        </View>
                    </Card.Footer>
                </Card>
            </Animated.View>
        </Pressable>
    );
};

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
