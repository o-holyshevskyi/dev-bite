import { ExploreCard } from "@/app/(tabs)/explore";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import useUserStore from "@/store/userStore";
import { useRouter } from "expo-router";
import { Card, useThemeColor } from "heroui-native";
import { useEffect } from "react";
import { Alert, Dimensions, Pressable, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const WIDTH = Dimensions.get('screen').width / 2.3;

interface ExploreCardProps {
    card: ExploreCard;
}

export const ExploreCardItem = ({ card }: ExploreCardProps) => {
    const router = useRouter();
    const isPro = useUserStore((state) => state.isPro);
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const success = useThemeColor('success');
    const warning = useThemeColor('warning');
    const danger = useThemeColor('danger');
    const scale = useSharedValue(1);
    const progressWidth = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    const progressAnimatedStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value * 100}%`,
    }));

    useEffect(() => {
        progressWidth.value = 0;
        progressWidth.value = withTiming(card.progress, {
            duration: 800,
            easing: Easing.out(Easing.exp),
        });
    }, [card.progress, progressWidth]);

    const resetScale = () => {
        scale.value = withTiming(1, { duration: 120 });
    };

    const handlePressIn = () => {
        scale.value = withTiming(0.97, { duration: 100 });
    };

    const handlePressOut = () => {
        resetScale();
    };

    const handlePress = () => {
        resetScale();

        if (card.isLocked && card.lockType === 'pro' && !isPro) {
            router.push('/paywall');
            return;
        }
        if (card.isLocked && card.lockType === 'progress') {
            Alert.alert(
                'Chapter Locked',
                card.lockReason ?? 'Complete previous chapter to unlock this pack.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Open Path',
                        onPress: () =>
                            router.push({
                                pathname: '/(tabs)/path',
                                params: { category: card.category, difficulty: card.difficult },
                            }),
                    },
                ],
            );
            return;
        }

        router.push({ pathname: '/pack/[id]', params: { id: card.id } });
    };
    
    return <Animated.View style={animatedStyle}>
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress}>
            <Card
                style={{
                    minWidth: WIDTH,
                    minHeight: WIDTH * 1.5,
                    backgroundColor: accent + '20',
                    gap: 8,
                    borderWidth: 1,
                    borderColor: accent + '40'
                }}
            >
                <Card.Header style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ backgroundColor: card.color + '40', borderRadius: 9999, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                        <IconSymbol name={card.icon as any} size={28} color={card.color} />
                    </View>
                    {card.lockType === 'pro' && <IconSymbol name={'lock.fill'} size={24} color={muted + '80'} />}
                </Card.Header>
                <Card.Body style={{ marginTop: 12, minHeight: 75 }}>
                    <ThemedText
                        numberOfLines={2}
                        style={{
                            fontSize: 24,
                            width: WIDTH / 1.2,
                            fontWeight: '400',
                            color: foreground
                        }}
                    >
                        {card.title}
                    </ThemedText>
                    <ThemedText
                        style={{
                            textTransform: 'uppercase',
                            color: muted + '80',
                            fontFamily: 'JetBrainsMono_700Bold'
                        }}
                    >{card.snippets.length} snippets</ThemedText>
                </Card.Body>
                <Card.Footer style={{ marginTop: 8 }}>
                    <ThemedText
                        style={{
                            textTransform: 'uppercase',
                            fontSize: 12,
                            color: card.progress > 0 ? accent : muted + '80',
                            fontFamily: 'JetBrainsMono_700Bold'
                        }}
                    >
                        {parseFloat((card.progress * 100).toFixed(2))}% completed
                    </ThemedText>
                    <View style={{ width: '100%' }}>
                        <View
                            style={{
                                height: 5,
                                width: '100%',
                                borderRadius: 4,
                                backgroundColor: accent + '40',
                                overflow: 'hidden',
                            }}
                        >
                            <Animated.View
                                style={[
                                    {
                                        height: '100%',
                                        backgroundColor: accent,
                                    },
                                    progressAnimatedStyle,
                                ]}
                            />
                        </View>
                    </View>
                    <View style={{
                        marginTop: 16,
                        flexDirection: 'row',
                        gap: 4,
                        justifyContent: 'flex-start',
                        alignItems: 'center'
                    }}>
                        <View
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: 999,
                                backgroundColor: card.difficult === 'easy' ?
                                    success :
                                    card.difficult === 'medium' ?
                                    warning : danger
                            }}
                        />
                        <ThemedText
                            style={{
                                textTransform: 'uppercase',
                                fontSize: 12,
                                color: muted + '80',
                                fontFamily: 'JetBrainsMono_700Bold'
                            }}
                        >{card.difficult}</ThemedText>
                    </View>
                </Card.Footer>
            </Card>
        </Pressable>
    </Animated.View>
}
