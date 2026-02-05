import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { format } from "date-fns";
// import { Icon } from "expo-router/unstable-native-tabs";
import { Button, Chip, useThemeColor } from "heroui-native";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

const Header = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');

    const [date, setDate] = useState<string>('');
    const [username, setUsername] = useState<string>('');

    useEffect(() => {
        const currentDate = new Date();
        const formattedDate = format(currentDate, 'EEEE, MMM dd');
        setDate(formattedDate);
    }, []);

    useEffect(() => {
        setUsername('Alex');
    }, []);

    return (
        <View style={[styles.headerContainer, { borderBottomColor: muted + '60', borderBottomWidth: 1 }]}>
            <View>
                <ThemedText style={[styles.headerDateText, { color: muted }]}>{date}</ThemedText>
                <ThemedText style={[styles.headerGreetingText, { color: foreground }]}>Good Morning, {username}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <StreakChip />
                <SettingsButtonIcon />
            </View>
        </View>
    );
}

const StreakChip = () => {
    const accent = useThemeColor('accent');
    const muted = useThemeColor('muted');

    return (
        <Chip size="lg" style={[styles.streakChip, { height: 32, borderColor: muted + '80', backgroundColor: accent + '60' }]}>
            <IconSymbol name="flame" size={18} color={'orange'} style={{ marginRight: 2 }} />
            <ThemedText style={[styles.streakChipText, { color: accent }]}>12</ThemedText>
        </Chip>
    );
}

const SettingsButtonIcon = () => {
    const accent = useThemeColor('accent');
    const handleSettingsPress = () => {
        Alert.alert('Settings button pressed');
    }

    return (
        <Button size="sm" variant="secondary" isIconOnly onPress={handleSettingsPress}>
            <IconSymbol name="gear" size={24} color={accent} />
        </Button>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerDateText: {
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    headerGreetingText: {
        fontSize: 24,
        fontWeight: '800',
        marginTop: 4,
    },
    streakChip: {
        alignSelf: 'center',
        borderWidth: 1,
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    streakChipText: {
        fontSize: 14,
        fontWeight: '800',
    },
});

export default Header;