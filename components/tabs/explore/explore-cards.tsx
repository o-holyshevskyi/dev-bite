import { ExploreCard } from "@/app/(tabs)/explore";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { Card, useThemeColor } from "heroui-native";
import { Dimensions, View } from "react-native";

const WIDTH = Dimensions.get('screen').width / 2.3;

interface ExploreCardProps {
    card: ExploreCard;
}

export const ExploreCardItem = ({ card }: ExploreCardProps) => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const success = useThemeColor('success');
    const warning = useThemeColor('warning');
    const danger = useThemeColor('danger');
    
    return <Card 
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
            {card.isLocked && <IconSymbol name={'lock.fill'} size={24} color={muted + '80'} />}
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
                {card.progress * 100}% completed
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
                    <View
                        style={{
                            height: '100%',
                            width: `${card.progress * 100}%`,
                            backgroundColor: accent,
                        }}
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
}
