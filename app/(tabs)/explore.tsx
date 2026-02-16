import { ExploreCardItem } from '@/components/tabs/explore/explore-cards';
import FilterChips from '@/components/tabs/explore/filter-chips';
import Header from '@/components/tabs/explore/header';
import SearchBar from '@/components/tabs/explore/search-bar';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import { useMemo, useState } from 'react';
import { ListRenderItem, StyleSheet, View } from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { quizPacks } from '@/src/data/mockData';
import useUserStore from '@/store/userStore';

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
    isLocked: boolean;
    title: string;
    snippets: Snippet[];
    difficult: 'easy' | 'medium' | 'hard'
    progress: number;
}

export default function ExploreScreen() {
    const scrollY = useSharedValue(0);
    const insets = useSafeAreaInsets();
    const packProgress = useUserStore((state) => state.packProgress);
    const isPro = useUserStore((state) => state.isPro);

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

            const matchesChip = filterChip === 'All'
                ? true
                : pack.language === filterChip || pack.tags?.includes(filterChip) === true;

            return matchesSearch && matchesChip;
        });
    }, [searchText, filterChip]);

    const exploreCards: ExploreCard[] = useMemo(() =>
        filteredPacks.map((pack) => {
            const progressForPack = packProgress.find((p) => p.packId === pack.id);
            const completed = progressForPack?.completedSnippetIds.length ?? 0;
            const total = pack.snippets.length || 1;
            const progress = completed / total;

            return {
                id: pack.id,
                icon: pack.icon,
                color: pack.color,
                isLocked: pack.isLocked && !isPro,
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
        }), [filteredPacks, isPro, packProgress]);

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
        <View style={[styles.container, { backgroundColor: '#000' }]}>
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
                        <FilterChips
                            chip={filterChip}
                            onChangeChip={setFilterChip}
                        />
                    </>
                }
                ListEmptyComponent={
                    <View style={[styles.emptyStateContainer, { paddingTop: HEADER_HEIGHT + 40 }]}>
                        <IconSymbol name="magnifyingglass" size={34} color="#6b7280" />
                        <ThemedText style={styles.emptyStateText}>
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
    emptyStateText: {
        color: '#6b7280',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
    },
});