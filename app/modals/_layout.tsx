import { StreakChip } from "@/components/tabs/index/header";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { useRouter } from "expo-router";
import Stack from "expo-router/build/layouts/StackClient";
import { useThemeColor } from "heroui-native";
import { Pressable, View } from "react-native";

function CustomHeader({ title }: { title: string }) {
    const router = useRouter();
    const bgColor = useThemeColor('background');
    const foreground = useThemeColor('foreground');
    
    return (
        <View style={{ 
            backgroundColor: bgColor, 
            paddingVertical: 16, 
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <Pressable onPress={() => router.back()}>
                <IconSymbol name="xmark" size={24} color={foreground} />
            </Pressable>
            <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>
                {title}
            </ThemedText>
            <StreakChip />
        </View>
    );
}

export default function ModalLayout() {
    const background = useThemeColor('background');

    return (
        <Stack
                screenOptions={{
                        contentStyle: {
                                backgroundColor: background,
                        },
                }}
        >
            <Stack.Screen 
                name="solve-snippet" 
                options={{ 
                        presentation: 'modal', 
                        header: () => <CustomHeader title="Daily Challenge" />,
                }} 
            />
        </Stack>
    );
}