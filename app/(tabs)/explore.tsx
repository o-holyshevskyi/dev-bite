import { ExploreCardItem } from '@/components/tabs/explore/explore-cards';
import FilterChips from '@/components/tabs/explore/filter-chips';
import Header from '@/components/tabs/explore/header';
import SearchBar from '@/components/tabs/explore/search-bar';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { useMemo, useState } from 'react';
import { ListRenderItem, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { quizPacks, type Difficulty } from '@/src/data/mockData';
import useUserStore from '@/store/userStore';
const DIFFICULTY_ORDER: Difficulty[] = [
    'easy',
    'medium',
    'hard',
    'advanced',
    'expert',
    'master',
    'principal',
];

interface Snippet {
    id: string,
    code: string,
    answers: [],
    correctAnswerId: string,
}

export interface ExploreCard {
    id: string;
    icon: string;
	color: string;
    category: string;
    isLocked: boolean;
    lockType?: 'pro' | 'progress';
    lockReason?: string;
    title: string;
    snippets: Snippet[];
    difficult: Difficulty
    progress: number;
}

export default function ExploreScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ category?: string | string[]; difficulty?: string | string[] }>();
    const background = useThemeColor('background');
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const surface = useThemeColor('surface');
    const border = useThemeColor('border');
    const scrollY = useSharedValue(0);
    const insets = useSafeAreaInsets();
    const packProgress = useUserStore((state) => state.packProgress);
    const isPro = useUserStore((state) => state.isPro);
    const selectedCategory = Array.isArray(params.category) ? params.category[0] : params.category;
    const selectedDifficulty = Array.isArray(params.difficulty) ? params.difficulty[0] : params.difficulty;
    const normalizedSelectedCategory = selectedCategory?.trim().toLowerCase() ?? '';
    const normalizedSelectedDifficulty = selectedDifficulty?.trim().toLowerCase() ?? '';

    const HEADER_HEIGHT = 60 + insets.top;

    const [searchText, setSearchText] = useState('');
    const [filterChip, setFilterChip] = useState('All');
    const trimmedSearchText = searchText.trim();

    const filteredPacks = useMemo(() => {
        const normalizedSearch = searchText.trim().toLowerCase();

        return quizPacks.filter((pack) => {
            const matchesSearch = normalizedSearch.length === 0
                ? true
                : pack.title.toLowerCase().includes(normalizedSearch) ||
                  (pack.description?.toLowerCase().includes(normalizedSearch) ?? false);
            const matchesCategory = normalizedSelectedCategory.length === 0
                ? true
                : (pack.category ?? pack.language).trim().toLowerCase() === normalizedSelectedCategory;
            const matchesDifficulty = normalizedSelectedDifficulty.length === 0
                ? true
                : pack.difficulty === normalizedSelectedDifficulty as Difficulty;

            const matchesChip = filterChip === 'All'
                ? true
                : pack.language === filterChip || pack.tags?.includes(filterChip) === true;

            return matchesSearch && matchesChip && matchesCategory && matchesDifficulty;
        });
    }, [filterChip, normalizedSelectedCategory, normalizedSelectedDifficulty, searchText]);

    const chapterProgress = useMemo(() => {
        const map: Record<string, number> = {};

        for (const pack of quizPacks) {
            const category = (pack.category ?? pack.language).trim();
            const key = `${category}:${pack.difficulty}`;
            if (map[key] !== undefined) continue;

            const packsInChapter = quizPacks.filter((candidate) =>
                (candidate.category ?? candidate.language).trim().toLowerCase() === category.toLowerCase() &&
                candidate.difficulty === pack.difficulty
            );
            const total = packsInChapter.reduce((sum, chapterPack) => sum + chapterPack.snippets.length, 0);
            const completedSnippetIds = new Set<string>();

            for (const chapterPack of packsInChapter) {
                const progress = packProgress.find((item) => item.packId === chapterPack.id);
                (progress?.completedSnippetIds ?? []).forEach((id) => completedSnippetIds.add(id));
            }

            map[key] = total > 0 ? (completedSnippetIds.size / total) * 100 : 0;
        }

        return map;
    }, [packProgress]);

    const exploreCards: ExploreCard[] = useMemo(() =>
        filteredPacks.map((pack) => {
            const progressForPack = packProgress.find((p) => p.packId === pack.id);
            const completed = progressForPack?.completedSnippetIds.length ?? 0;
            const total = pack.snippets.length || 1;
            const progress = completed / total;
            const category = (pack.category ?? pack.language).trim();
            const currentDifficultyIndex = DIFFICULTY_ORDER.indexOf(pack.difficulty);
            const previousDifficulty = currentDifficultyIndex > 0
                ? DIFFICULTY_ORDER[currentDifficultyIndex - 1]
                : null;
            const previousProgress = previousDifficulty
                ? chapterProgress[`${category}:${previousDifficulty}`] ?? 0
                : 100;
            const progressLocked = previousDifficulty ? previousProgress < 100 : false;
            const proLocked = pack.isLocked && !isPro;
            const lockType: ExploreCard['lockType'] | undefined = proLocked ? 'pro' : progressLocked ? 'progress' : undefined;
            const lockReason = progressLocked
                ? `Complete ${previousDifficulty?.toUpperCase()} chapter to unlock ${pack.difficulty.toUpperCase()}.`
                : proLocked
                    ? 'Unlock PRO to access this pack.'
                    : undefined;

            return {
                id: pack.id,
                icon: pack.icon,
                color: pack.color,
                category,
                isLocked: proLocked || progressLocked,
                lockType,
                lockReason,
                title: pack.title,
                snippets: pack.snippets.map((snippet) => ({
                    id: snippet.id,
                    code: snippet.code,
                    answers: [],
                    correctAnswerId: snippet.correctAnswerId,
                })),
                difficult: pack.difficulty,
                progress,
            };
        }), [chapterProgress, filteredPacks, isPro, packProgress]);

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

    const renderItem: ListRenderItem<ExploreCard> = ({ item }) => (
        <ExploreCardItem card={item} />
    );

    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            <View style={[styles.headerContainer, { height: HEADER_HEIGHT }]} pointerEvents="box-none">
                <Animated.View style={[styles.animatedHeader, headerAnimatedStyle]}>
                    <View style={{ paddingTop: insets.top }}>
                        <Header />
                    </View>
                </Animated.View>
            </View>

            <Animated.FlatList<ExploreCard>
                data={exploreCards}
                keyExtractor={(item, index) => `${item.title}-${index}`}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
				numColumns={2}
				columnWrapperStyle={{
					gap: 20,
					paddingVertical: 7,
					alignSelf: 'center',
				}}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingTop: HEADER_HEIGHT + 20,
                    paddingBottom: 80,
					paddingHorizontal: 16
                }}
                ListHeaderComponent={
                    <>
                        <SearchBar
                            value={searchText}
                            onChangeText={setSearchText}
                            onClearText={() => setSearchText('')}
                        />
                        {selectedCategory ? (
                            <View style={styles.categoryPillRow}>
                                <View style={[styles.categoryPill, { borderColor: border, backgroundColor: surface }]}>
                                    <IconSymbol name="map.fill" size={14} color={foreground} />
                                    <ThemedText style={[styles.categoryPillText, { color: foreground }]}>
                                        {selectedCategory}
                                    </ThemedText>
                                    {selectedDifficulty ? (
                                        <ThemedText style={[styles.categoryPillDivider, { color: muted }]}>·</ThemedText>
                                    ) : null}
                                    {selectedDifficulty ? (
                                        <ThemedText style={[styles.categoryPillText, { color: foreground }]}>
                                            {selectedDifficulty.toUpperCase()}
                                        </ThemedText>
                                    ) : null}
                                </View>
                                <Pressable onPress={() => router.replace('/(tabs)/explore')}>
                                    <ThemedText style={[styles.categoryClearText, { color: muted }]}>Clear</ThemedText>
                                </Pressable>
                            </View>
                        ) : null}
                        <FilterChips
                            chip={filterChip}
                            onChangeChip={setFilterChip}
                        />
                    </>
                }
                ListEmptyComponent={
                    <View style={[styles.emptyStateContainer, { paddingTop: HEADER_HEIGHT + 40 }]}>
                        <IconSymbol name="magnifyingglass" size={34} color={muted} />
                        <ThemedText style={[styles.emptyStateText, { color: muted }]}>
                            {trimmedSearchText.length > 0
                                ? `No packs found for "${trimmedSearchText}"`
                                : 'Try adjusting your filters.'}
                        </ThemedText>
                    </View>
                }
            />
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
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    categoryPillRow: {
        marginTop: 10,
        marginBottom: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 2,
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    categoryPillText: {
        fontSize: 12,
        fontWeight: '700',
    },
    categoryPillDivider: {
        fontSize: 12,
        fontWeight: '700',
        marginHorizontal: 2,
    },
    categoryClearText: {
        fontSize: 12,
        fontWeight: '700',
    },
    emptyStateText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
    },
});