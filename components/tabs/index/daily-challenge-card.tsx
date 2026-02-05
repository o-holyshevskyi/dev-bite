import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { Avatar, Button, Card, useThemeColor } from "heroui-native";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

const DailyChallengeCard = () => {
    const accent = useThemeColor('accent');
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');

    const [users, setUsers] = useState<{ name: string; avatarUrl: string }[]>([]);

    useEffect(() => {
        setUsers([
            { name: 'Alice Brown', avatarUrl: 'https://i.pravatar.cc/300' },
            { name: 'Bob Smith', avatarUrl: 'https://i.pravatar.cc/300' },
            { name: '2 4', avatarUrl: '' },
        ]);
    }, []);

    const handleTapToSolvePress = () => {
        Alert.alert('Tap to Solve button pressed');
    }

    return (
        <View style={styles.cardContainer}>
            <Card
                style={[
                    styles.card,
                    {
                        backgroundColor: "#000",
                        borderColor: accent,
                        shadowColor: accent,
                    },
                ]}
            >
                <Card.Header style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <View style={{ width: 10, height: 10, backgroundColor: accent, borderRadius: 6 }}></View>
                        <ThemedText style={[styles.cardHeaderText, { color: accent }]}>Daily Challenge</ThemedText>
                    </View>
                    <ThemedText style={{ color: foreground, fontWeight: '600', fontSize: 24 }}>Fix the Memory Leak</ThemedText>
                </Card.Header>
                <Card.Body style={{ marginBottom: 18 }}>
                    <View style={{ 
                            backgroundColor: muted + '20', 
                            padding: 12, 
                            borderRadius: 8, 
                            borderStartWidth: 2, 
                            borderColor: accent, 
                            width: '75%'
                        }}
                    >
                        <ThemedText style={{ color: muted, fontSize: 16, lineHeight: 22 }}>
                            void *ptr = malloc(512);
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
                            <ThemedText numberOfLines={2} style={{ 
                                color: muted, 
                                lineHeight: 18, 
                                width: 80 
                            }}>
                                Solvers today
                            </ThemedText>
                        </View>
                        <Button size="md" variant="primary" onPress={handleTapToSolvePress}>
                            <ThemedText style={{ color: foreground, fontWeight: '600', textTransform: 'uppercase' }}>
                                Tap to Solve
                            </ThemedText>
                            <IconSymbol name="chevron.forward" size={12} color={foreground} />
                        </Button>
                    </View>
                </Card.Footer>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        paddingHorizontal: 16,
        paddingVertical: 32,
    },
    card: {
        borderWidth: 2,
        shadowOpacity: 1,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 0 }
    },
    cardHeaderText: {
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
    }
});

export default DailyChallengeCard;