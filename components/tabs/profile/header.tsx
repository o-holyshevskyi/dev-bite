import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { format } from "date-fns";
import { Button, useThemeColor } from "heroui-native";
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
                <ThemedText style={[styles.headerTitleText, { color: foreground }]}>Profile</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <SettingsButtonIcon />
            </View>
        </View>
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
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitleText: {
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