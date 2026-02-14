import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Components
import DailyChallengeCard from '@/components/tabs/index/daily-challenge-card';
import Header from '@/components/tabs/index/header';
import RecentPacksCard from '@/components/tabs/index/recent-packs-card';
import Stats from '@/components/tabs/index/stats';

export default function HomeScreen() {
  const scrollY = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [isScrolling, setIsScrolling] = React.useState(false);
  const [shouldRenderRecent, setShouldRenderRecent] = React.useState(false);
  const recentSectionY = useSharedValue(Number.POSITIVE_INFINITY);
  
  const HEADER_HEIGHT = 60 + insets.top; 

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

  const dailySectionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 120], [1, 0.94], Extrapolation.CLAMP);
    return { opacity };
  });

  useAnimatedReaction(
    () => {
      return scrollY.value + windowHeight + 120 >= recentSectionY.value;
    },
    (shouldMount, wasMounted) => {
      if (shouldMount && !wasMounted) {
        runOnJS(setShouldRenderRecent)(true);
      }
    },
    [windowHeight]
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

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        onScroll={scrollHandler}
        onScrollBeginDrag={() => setIsScrolling(true)}
        onScrollEndDrag={() => setIsScrolling(false)}
        onMomentumScrollBegin={() => setIsScrolling(true)}
        onMomentumScrollEnd={() => setIsScrolling(false)}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + 20, paddingBottom: 80 }}
      >
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[styles.dailySectionInitial, dailySectionStyle]}
        >
          <DailyChallengeCard pauseEffects={isScrolling} />
        </Animated.View>
        <View>
          <Stats />
        </View>
        <View
          onLayout={(event) => {
            recentSectionY.value = event.nativeEvent.layout.y;
          }}
        >
          {shouldRenderRecent ? <RecentPacksCard /> : null}
        </View>
      </Animated.ScrollView>
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
  dailySectionInitial: {
    opacity: 1,
  },
});