import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import useUserStore from '@/store/userStore';

type Slide = {
  title: string;
  description: string;
  icon: 'terminal.fill' | 'flame.fill' | 'trophy.fill';
};

const SLIDES: Slide[] = [
  {
    title: 'Master Code in 1 Minute',
    description: 'Daily bite-sized challenges that sharpen your interview reflexes fast.',
    icon: 'terminal.fill',
  },
  {
    title: 'Maintain Your Streak',
    description: 'Stay consistent, stack wins, and build momentum every single day.',
    icon: 'flame.fill',
  },
  {
    title: 'Join the Leaderboard',
    description: 'Climb the ranks, flex your progress, and compete with top developers.',
    icon: 'trophy.fill',
  },
];

function PaginationDot({
  index,
  progressX,
  slideWidth,
  activeColor,
}: {
  index: number;
  progressX: { value: number };
  slideWidth: number;
  activeColor: string;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * slideWidth,
      index * slideWidth,
      (index + 1) * slideWidth,
    ];

    return {
      width: interpolate(progressX.value, inputRange, [10, 28, 10], 'clamp'),
      opacity: interpolate(progressX.value, inputRange, [0.45, 1, 0.45], 'clamp'),
    };
  }, [index, slideWidth]);

  return (
    <Animated.View
      style={[
        styles.paginationDot,
        { backgroundColor: activeColor + 'AA' },
        animatedStyle,
      ]}
    />
  );
}

function IntroSlide({
  item,
  index,
  width,
  accent,
  foreground,
  muted,
  scrollX,
  onGetStarted,
}: {
  item: Slide;
  index: number;
  width: number;
  accent: string;
  foreground: string;
  muted: string;
  scrollX: { value: number };
  onGetStarted: () => void;
}) {
  const isLastSlide = index === SLIDES.length - 1;
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const iconParallaxStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          scrollX.value,
          inputRange,
          [width * 0.24, 0, -width * 0.24],
          'clamp',
        ),
      },
    ],
  }));

  const titleParallaxStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          scrollX.value,
          inputRange,
          [width * 0.14, 0, -width * 0.14],
          'clamp',
        ),
      },
    ],
  }));

  const descriptionParallaxStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          scrollX.value,
          inputRange,
          [width * 0.08, 0, -width * 0.08],
          'clamp',
        ),
      },
    ],
  }));

  const fadeSlideStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, inputRange, [0.35, 1, 0.35], 'clamp'),
  }));

  return (
    <Animated.View style={[styles.slide, { width }, fadeSlideStyle]}>
      <Animated.View
        entering={FadeInDown.delay(200).duration(800)}
        style={iconParallaxStyle}
      >
        <View
          style={[
            styles.iconGlow,
            {
              backgroundColor: accent + '26',
              shadowColor: accent,
            },
          ]}
        >
          <IconSymbol name={item.icon} size={80} color={accent} />
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(800)}
        style={titleParallaxStyle}
      >
        <ThemedText style={[styles.title, { color: foreground }]}>{item.title}</ThemedText>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(800)}
        style={descriptionParallaxStyle}
      >
        <ThemedText style={[styles.description, { color: muted }]}>
          {item.description}
        </ThemedText>
      </Animated.View>

      {isLastSlide && (
        <Pressable
          onPress={onGetStarted}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: accent,
              opacity: pressed ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <ThemedText style={styles.buttonText}>Get Started</ThemedText>
        </Pressable>
      )}
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const accent = useThemeColor('accent');
  const foreground = useThemeColor('foreground');
  const muted = useThemeColor('muted');
  const setName = useUserStore((state) => state.setName);
  const setTitle = useUserStore((state) => state.setTitle);
  const setAvatarUrl = useUserStore((state) => state.setAvatarUrl);
  const setStack = useUserStore((state) => state.setStack);
  const setDifficulty = useUserStore((state) => state.setDifficulty);
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);
  const [showSetupFlow, setShowSetupFlow] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [name, setNameLocal] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedStack, setSelectedStackLocal] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevelLocal] = useState('');
  const [position, setPosition] = useState('');

  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const canGoNext = useMemo(() => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return true;
    if (step === 2) return selectedStack.length > 0;
    if (step === 3) return !!selectedLevel && position.trim().length > 0;
    return false;
  }, [step, name, selectedStack, selectedLevel, position]);

  const handleGetStarted = useCallback(() => {
    setShowSetupFlow(true);
  }, []);

  const handlePickAvatar = useCallback(async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        'Permission required',
        'Permission to access your photos is required to pick an avatar.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedAvatar(result.assets[0].uri);
    }
  }, []);

  const handleNextSetupStep = useCallback(() => {
    if (!canGoNext) return;

    if (step === 0) {
      setName(name.trim());
      setStep(1);
      return;
    }

    if (step === 1) {
      if (selectedAvatar) setAvatarUrl(selectedAvatar);
      setStep(2);
      return;
    }

    if (step === 2) {
      setStack(selectedStack);
      setStep(3);
      return;
    }

    setDifficulty(selectedLevel);
    setTitle(position.trim());
    completeOnboarding();
    router.replace('/(tabs)');
  }, [
    canGoNext,
    completeOnboarding,
    name,
    position,
    router,
    selectedAvatar,
    selectedLevel,
    selectedStack,
    setAvatarUrl,
    setDifficulty,
    setName,
    setStack,
    setTitle,
    step,
  ]);

  const toggleStack = useCallback((stack: string) => {
    setSelectedStackLocal((prev) =>
      prev.includes(stack) ? prev.filter((item) => item !== stack) : [...prev, stack],
    );
  }, []);

  const buttonLabel = step === 3 ? 'Finish' : 'Next';

  const renderItem = useCallback(
    ({ item, index }: { item: Slide; index: number }) => {
      return (
        <IntroSlide
          item={item}
          index={index}
          width={width}
          accent={accent}
          foreground={foreground}
          muted={muted}
          scrollX={scrollX}
          onGetStarted={handleGetStarted}
        />
      );
    },
    [accent, foreground, handleGetStarted, muted, scrollX, width],
  );

  if (showSetupFlow) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.setupContainer}>
          <View style={styles.setupHeader}>
            <Text style={styles.appTitle}>DevBite</Text>
            <Text style={[styles.subtitle, { color: muted }]}>
              Let&apos;s tailor your interview drills.
            </Text>
          </View>

          <View style={styles.stepIndicator}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.stepDot,
                  { backgroundColor: index <= step ? accent : '#27272A' },
                ]}
              />
            ))}
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {step === 0 && (
              <View>
                <Text style={styles.stepTitle}>Who&apos;s coding today?</Text>
                <Text style={[styles.stepDescription, { color: muted }]}>
                  We&apos;ll use your name across daily challenges and progress.
                </Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput
                    value={name}
                    onChangeText={setNameLocal}
                    placeholder="e.g. Alex"
                    placeholderTextColor="#7A7A7A"
                    style={styles.textInput}
                    returnKeyType="done"
                  />
                </View>
              </View>
            )}

            {step === 1 && (
              <View>
                <Text style={styles.stepTitle}>Choose an avatar</Text>
                <Text style={[styles.stepDescription, { color: muted }]}>
                  Pick a picture, or skip and we&apos;ll use your initials.
                </Text>
                <View style={styles.avatarRow}>
                  <Pressable
                    style={[
                      styles.avatarCircle,
                      selectedAvatar && {
                        borderColor: accent,
                        shadowColor: accent,
                      },
                    ]}
                    onPress={handlePickAvatar}
                  >
                    {selectedAvatar ? (
                      <Image source={{ uri: selectedAvatar }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarPlaceholderText}>Pick from photos</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            )}

            {step === 2 && (
              <View>
                <Text style={styles.stepTitle}>Pick your stack</Text>
                <Text style={[styles.stepDescription, { color: muted }]}>
                  Choose everything you want DevBite to focus on.
                </Text>
                <View style={styles.grid}>
                  {['React', 'TypeScript', 'Python', 'Go', '.NET'].map((stack) => {
                    const isSelected = selectedStack.includes(stack);
                    return (
                      <Pressable
                        key={stack}
                        style={[
                          styles.card,
                          isSelected && {
                            borderColor: accent,
                            backgroundColor: '#1F2933',
                          },
                        ]}
                        onPress={() => toggleStack(stack)}
                      >
                        <Text style={styles.cardTitle}>{stack}</Text>
                        {isSelected && (
                          <Text style={[styles.cardBadge, { backgroundColor: accent }]}>
                            Selected
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {step === 3 && (
              <View>
                <Text style={styles.stepTitle}>What&apos;s your level?</Text>
                <Text style={[styles.stepDescription, { color: muted }]}>
                  We&apos;ll tune the difficulty and your profile.
                </Text>
                <View style={styles.levelColumn}>
                  {['Junior', 'Mid', 'Senior'].map((level) => {
                    const isSelected = selectedLevel === level;
                    return (
                      <Pressable
                        key={level}
                        style={[
                          styles.levelCard,
                          isSelected && {
                            borderColor: accent,
                            backgroundColor: '#1F2933',
                          },
                        ]}
                        onPress={() => setSelectedLevelLocal(level)}
                      >
                        <Text style={styles.levelTitle}>{level}</Text>
                        <Text style={[styles.levelSubtitle, { color: muted }]}>
                          {level === 'Junior' &&
                            'You are getting comfortable with fundamentals.'}
                          {level === 'Mid' &&
                            'You ship features end-to-end and own systems.'}
                          {level === 'Senior' &&
                            'You design systems, mentor others and love tricky edge cases.'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={[styles.inputContainer, { marginTop: 24 }]}>
                  <Text style={styles.inputLabel}>Position</Text>
                  <TextInput
                    value={position}
                    onChangeText={setPosition}
                    placeholder="e.g. Senior Frontend Engineer"
                    placeholderTextColor="#7A7A7A"
                    style={styles.textInput}
                    returnKeyType="done"
                  />
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              {step > 0 && (
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => setStep((prev) => (prev - 1) as 0 | 1 | 2 | 3)}
                >
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </Pressable>
              )}
              {step === 1 && (
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => {
                    setSelectedAvatar(null);
                    setStep(2);
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Skip</Text>
                </Pressable>
              )}
              <Pressable
                style={[
                  styles.primaryButton,
                  { backgroundColor: accent },
                  !canGoNext && styles.primaryButtonDisabled,
                ]}
                onPress={handleNextSetupStep}
              >
                <Text style={styles.primaryButtonText}>{buttonLabel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.FlatList
        data={SLIDES}
        keyExtractor={(item) => item.title}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      <View style={styles.paginationWrap}>
        {SLIDES.map((_, index) => (
          <PaginationDot
            key={index}
            index={index}
            progressX={scrollX}
            slideWidth={width}
            activeColor={accent}
          />
        ))}
      </View>

      <View style={styles.introFooter}>
        <Pressable style={styles.secondaryButton} onPress={handleGetStarted}>
          <Text style={styles.secondaryButtonText}>Skip</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050506',
  },
  setupContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  setupHeader: {
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  stepDot: {
    flex: 1,
    height: 4,
    borderRadius: 999,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    marginBottom: 24,
  },
  inputContainer: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#D4D4D8',
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: '#FFFFFF',
    backgroundColor: '#09090B',
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#27272A',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#09090B',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholderText: {
    color: '#E4E4E7',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  card: {
    flexBasis: '47%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#27272A',
    padding: 16,
    backgroundColor: '#09090B',
    justifyContent: 'space-between',
    minHeight: 96,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    color: '#000000',
    fontSize: 11,
    fontWeight: '600',
  },
  levelColumn: {
    gap: 12,
    marginTop: 8,
  },
  levelCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#27272A',
    padding: 16,
    backgroundColor: '#09090B',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  levelSubtitle: {
    fontSize: 13,
  },
  footer: {
    paddingVertical: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  primaryButton: {
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  secondaryButton: {
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E4E4E7',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconGlow: {
    width: 168,
    height: 168,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    shadowOpacity: 0.45,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  description: {
    marginTop: 14,
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'center',
    maxWidth: 320,
  },
  button: {
    marginTop: 44,
    borderRadius: 999,
    minWidth: 220,
    paddingHorizontal: 28,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '800',
  },
  paginationWrap: {
    position: 'absolute',
    bottom: 34,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paginationDot: {
    height: 10,
    borderRadius: 99,
  },
  introFooter: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    zIndex: 4,
  },
});

