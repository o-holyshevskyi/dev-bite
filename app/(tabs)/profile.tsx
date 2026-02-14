import { StyleSheet, View } from 'react-native';

import Header from '@/components/tabs/profile/header';
import Hero from '@/components/tabs/profile/hero';
import Level from '@/components/tabs/profile/level';
import Stats from '@/components/tabs/profile/stats';
import Badges from '@/components/tabs/profile/badges';
import UpgradeCta from '@/components/tabs/profile/upgrade-cta';
import Preferences from '@/components/tabs/profile/preferences';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const scrollY = useSharedValue(0);
  const insets = useSafeAreaInsets();
  
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
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + 20, paddingBottom: 80 }}
      >
        <Hero />
        <Level />
        <Stats />
        <Badges />
        <UpgradeCta />
        <Preferences />
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
});
