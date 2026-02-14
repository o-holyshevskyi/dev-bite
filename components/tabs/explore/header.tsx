import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "heroui-native";
import { StyleSheet, View } from "react-native";

const Header = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');

    return (
        <View style={[styles.headerContainer, { borderBottomColor: muted + '60', borderBottomWidth: 1 }]}>
            <ThemedText style={[styles.headerTitleText, { color: foreground }]}>Explore</ThemedText>
        </View>
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
        fontSize: 26,
        fontWeight: '800',
    },
});

export default Header;