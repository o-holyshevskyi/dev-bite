import { ExploreCardItem } from '@/components/tabs/explore/explore-cards';
import FilterChips from '@/components/tabs/explore/filter-chips';
import Header from '@/components/tabs/explore/header';
import SearchBar from '@/components/tabs/explore/search-bar';
import { useState } from 'react';
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

    const HEADER_HEIGHT = 60 + insets.top;

    const [searchText, setSearchText] = useState('');
    const [filterChip, setFilterChip] = useState('All');

    const exploreCards: ExploreCard[] = quizPacks.map((pack) => {
        const progressForPack = packProgress.find((p) => p.packId === pack.id);
        const completed = progressForPack?.completedSnippetIds.length ?? 0;
        const total = pack.snippets.length || 1;
        const progress = completed / total;

        return {
            icon: pack.icon,
            color: pack.color,
            isLocked: pack.isLocked,
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
    });

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
});