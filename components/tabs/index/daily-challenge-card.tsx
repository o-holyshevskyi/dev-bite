import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { useDailyChallenge } from "@/hooks/useDailyChallenge";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, Button, Card, useThemeColor } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
    cancelAnimation,
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming
} from "react-native-reanimated";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const DailyChallengeCard = ({ pauseEffects = false }: { pauseEffects?: boolean }) => {
    const background = useThemeColor('background');
    const accent = useThemeColor('accent');
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const danger = useThemeColor('danger');
    const purple = '#A855F7';
    const green = '#22C55E';
    const yellow = '#EAB308';
    const red = '#EF4444';
    const orange = '#F97316';

    const daily = useDailyChallenge();
    const challengeSnippet = daily?.current?.snippet ?? null;
    const results = daily?.results ?? [0, 0, 0];
    const progressCount = daily?.progressCount ?? 0;
    const isCompleted = daily?.isCompleted ?? false;
    const currentQuestionId =
        daily?.questionIds[daily?.currentIndex ?? 0] ?? null;

    const [remainingLabel, setRemainingLabel] = useState('');
    const pressScale = useSharedValue(1);
    const sweepProgress = useSharedValue(0);
    const cardWidth = useSharedValue(0);

    const [users, setUsers] = useState<{ name: string; avatarUrl: string }[]>([]);

    useEffect(() => {
        const random1 = Math.floor(Math.random() * 10);
        const random2 = Math.floor(Math.random() * 10);

        setUsers([
            { name: 'Alice Brown', avatarUrl: 'https://i.pravatar.cc/300' },
            { name: 'Bob Smith', avatarUrl: 'https://i.pravatar.cc/300' },
            { name: `${random1 === 0 ? '' : random1} ${random2}`, avatarUrl: '' },
        ]);
    }, []);

    useEffect(() => {
        if (!isCompleted) {
            setRemainingLabel('');
            return;
        }

        const updateRemaining = () => {
            const now = new Date();
            const nextMidnight = new Date(now);
            nextMidnight.setHours(24, 0, 0, 0);
            const diffMs = Math.max(0, nextMidnight.getTime() - now.getTime());
            const totalSeconds = Math.floor(diffMs / 1000);
            const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
            const seconds = String(totalSeconds % 60).padStart(2, '0');
            setRemainingLabel(`${hours}:${minutes}:${seconds}`);
        };

        updateRemaining();
        const timer = setInterval(updateRemaining, 1000);
        return () => clearInterval(timer);
    }, [isCompleted]);

    const startSweep = () => {
        sweepProgress.value = withRepeat(
            withTiming(1, { duration: 2000, easing: Easing.linear }),
            -1,
            true
        );
    };

    useEffect(() => {
        if (pauseEffects) {
            cancelAnimation(sweepProgress);
            return;
        }
        startSweep();
        return () => cancelAnimation(sweepProgress);
    }, [pauseEffects, sweepProgress]);

    const ui = useMemo(() => {
        if (isCompleted) {
            return {
                title: 'Daily Goals Crushed! 🎉',
                buttonLabel: 'Review Answers',
            };
        }

        if (progressCount > 0) {
            return {
                title: 'Keep going!',
                buttonLabel: 'Continue',
            };
        }

        return {
            title: 'Daily Challenge',
            buttonLabel: 'Start Challenge',
        };
    }, [isCompleted, progressCount]);

    const handleTapToSolvePress = () => {
        if (isCompleted) {
            router.push('/daily/results' as never);
            return;
        }
        const targetId = currentQuestionId;
        if (targetId) {
            router.push({
                pathname: '/quiz/[id]',
                params: { id: targetId },
            });
        } else {
            router.push('/modals/solve-snippet');
        }
    }

    const handlePressIn = () => {
        cancelAnimation(sweepProgress);
        pressScale.value = withTiming(0.97, { duration: 120 });
    };

    const handlePressOut = () => {
        if (!pauseEffects) {
            startSweep();
        }
        pressScale.value = withSpring(1, {
            damping: 14,
            stiffness: 220,
            mass: 0.7,
        });
    };

    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pressScale.value }],
    }));

    const animatedGradientStyle = useAnimatedStyle(() => {
        const safeWidth = Math.max(1, cardWidth.value);
        return {
            width: safeWidth * 2,
            transform: [
                {
                    translateX: interpolate(
                        sweepProgress.value,
                        [0, 1],
                        [-safeWidth, 0]
                    ),
                },
            ],
        };
    });

    return (
        <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
            <Pressable onPress={handleTapToSolvePress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                <View
                    style={styles.gradientBorder}
                    onLayout={(event) => {
                        cardWidth.value = event.nativeEvent.layout.width;
                    }}
                >
                    <AnimatedLinearGradient
                        pointerEvents="none"
                        colors={[accent, purple, green, yellow, red, orange, accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.gradientSweep, animatedGradientStyle]}
                    />
                    <Animated.View style={[styles.cardSurface, { backgroundColor: background }]}>
                        <Card
                            style={[
                                styles.card,
                                {
                                    backgroundColor: background,
                                    shadowColor: accent,
                                },
                            ]}
                        >
                            <Card.Header style={{ marginBottom: 12 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                    <View style={{ width: 10, height: 10, backgroundColor: accent, borderRadius: 6 }}></View>
                                    <ThemedText style={[styles.cardHeaderText, { color: accent }]}>Daily Challenge</ThemedText>
                                </View>
                                <ThemedText style={{ color: foreground, fontWeight: '600', fontSize: 24 }}>
                                    {ui.title}
                                </ThemedText>
                                <View style={styles.progressDots}>
                                    {results.map((result, index) => {
                                        const backgroundColor =
                                            result === 1
                                                ? accent
                                                : result === 2
                                                    ? danger
                                                    : 'transparent';
                                        const borderColor =
                                            result === 0 ? muted + '90' : backgroundColor;

                                        return (
                                            <View
                                                key={index}
                                                style={[
                                                    styles.dot,
                                                    {
                                                        backgroundColor,
                                                        borderColor,
                                                    },
                                                ]}
                                            />
                                        );
                                    })}
                                </View>
                                {isCompleted && (
                                    <ThemedText style={{ color: muted, marginTop: 8 }}>
                                        Next challenge in: {remainingLabel}
                                    </ThemedText>
                                )}
                            </Card.Header>
                            <Card.Body style={{ marginBottom: 18 }}>
                                <View style={{
                                    backgroundColor: muted + '20',
                                    padding: 12,
                                    borderRadius: 8,
                                    borderStartWidth: 2,
                                    borderColor: accent,
                                    width: '80%'
                                }}
                                >
                                    <ThemedText style={{ color: muted, fontSize: 16, lineHeight: 22, fontFamily: 'JetBrainsMono_400Regular' }}>
                                        {challengeSnippet?.code ?? 'void *ptr = malloc(512);'}
                                    </ThemedText>
                                </View>
                            </Card.Body>
                            <Card.Footer style={{ marginBottom: 12 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: -5 }}>
                                        {users.map((user, index) => (
                                            <Avatar
                                                key={index}
                                                size="sm"
                                                alt={user.name}
                                                style={{ marginLeft: index === 0 ? 0 : -16, borderWidth: 2, borderColor: "#000002" }}
                                            >
                                                <Avatar.Image source={{ uri: user.avatarUrl }} />
                                                <Avatar.Fallback>+{user.name.split(' ').map(n => n[0]).join('')}</Avatar.Fallback>
                                            </Avatar>
                                        ))}
                                        {/* <ThemedText numberOfLines={2} style={{ 
                                            color: muted, 
                                            lineHeight: 18, 
                                            width: 80 
                                        }}>
                                            Solvers today
                                        </ThemedText> */}
                                    </View>
                                    <Button size="sm" variant="primary" onPress={handleTapToSolvePress}>
                                        <ThemedText style={{ color: foreground, fontWeight: '600', textTransform: 'uppercase' }}>
                                            {ui.buttonLabel}
                                        </ThemedText>
                                        <IconSymbol name="chevron.forward" size={12} color={foreground} />
                                    </Button>
                                </View>
                            </Card.Footer>
                        </Card>
                    </Animated.View>
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        paddingHorizontal: 16,
        paddingVertical: 32,
    },
    gradientBorder: {
        borderRadius: 20,
        padding: 2,
        overflow: 'hidden',
    },
    gradientSweep: {
        ...StyleSheet.absoluteFillObject,
    },
    cardSurface: {
        borderRadius: 18,
        overflow: 'hidden',
    },
    card: {
        borderWidth: 0,
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 0 },
        borderRadius: 18,
    },
    cardHeaderText: {
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    progressDots: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1.5,
    },
});

export default DailyChallengeCard;