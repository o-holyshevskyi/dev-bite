import { ThemedText } from "@/components/themed-text";
import useUserStore from "@/store/userStore";
import { Avatar, useThemeColor } from "heroui-native";
import { View } from "react-native";

const Hero = () => {
    const accent = useThemeColor('accent');
    const foreground = useThemeColor('foreground');
    const profile = useUserStore((state) => state.profile);

    return <View >
        <View style={{ alignItems: 'center' }}>
            <View
                style={{
                    backgroundColor: accent + '80',
                    padding: 4,
                    borderRadius: 9999,
                    shadowOpacity: 1,
                    shadowColor: accent,
                    shadowRadius: 7,
                    shadowOffset: { width: 0, height: 0 }
                }}
            >
                <View
                    style={{
                        backgroundColor: accent,
                        padding: 4,
                        borderRadius: 9999,
                        borderWidth: 4,
                        borderColor: '#000'
                    }}
                >
                <Avatar  
                    alt={profile.name} 
                    style={{ height: 150, width: 150 }}
                >
                    <Avatar.Image source={{ uri: profile.avatarUrl }} />
                    <Avatar.Fallback style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <ThemedText style={{ color: accent, fontSize: 42, fontWeight: 'bold', textAlign: 'center', padding: 50, marginTop: 25 }}>
                            {profile.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                        </ThemedText>
                    </Avatar.Fallback>
                </Avatar>
                </View>
            </View>
        </View>
        <View
            style={{
                marginTop: 18,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 12
            }}
        >
            <ThemedText
                style={{
                    fontSize: 32,
                    lineHeight: 32,
                    fontWeight: 'bold',
                    color: foreground
                }}
            >
                {profile.name}
            </ThemedText>
            <ThemedText
                style={{
                    fontSize: 18,
                    color: accent,
                    textTransform: 'uppercase'
                }}
            >
                {profile.title}
            </ThemedText>
        </View>
    </View>
}

export default Hero;
