import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import useUserStore from "@/store/userStore";
import * as ImagePicker from "expo-image-picker";
import { Avatar, useThemeColor } from "heroui-native";
import { type ReactNode } from "react";
import {
    Alert,
    Platform,
    Pressable,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

type TactilePressableProps = {
  onPress: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

function TactilePressable({ onPress, children, style }: TactilePressableProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

const Hero = () => {
  const accent = useThemeColor("accent");
  const foreground = useThemeColor("foreground");
  const profile = useUserStore((state) => state.profile);
  const updateProfile = useUserStore((state) => state.updateProfile);

  const openNameEditor = () => {
    if (Platform.OS !== "ios") {
      Alert.alert("Coming Soon", "Name editing on Android is coming soon.");
      return;
    }

    Alert.prompt(
      "Update Name",
      "Enter your new display name.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: (value?: string) => {
            const trimmedValue = value?.trim() ?? "";
            if (trimmedValue.length > 0) {
              updateProfile({ name: trimmedValue });
            }
          },
        },
      ],
      "plain-text",
      profile.name,
    );
  };

  const openTitleEditor = () => {
    if (Platform.OS !== "ios") {
      Alert.alert("Coming Soon", "Title editing on Android is coming soon.");
      return;
    }

    Alert.prompt(
      "Update Title",
      "Enter your title or position.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: (value?: string) => {
            const trimmedValue = value?.trim() ?? "";
            if (trimmedValue.length > 0) {
              updateProfile({ title: trimmedValue });
            }
          },
        },
      ],
      "plain-text",
      profile.title,
    );
  };

  const openAvatarActions = () => {
    const handlePickAvatarFromGallery = async () => {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "Permission to access your photos is required to choose an avatar.",
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
        updateProfile({ avatarUrl: result.assets[0].uri });
      }
    };

    Alert.alert("Change Profile Picture", "Choose an avatar option.", [
      {
        text: "Choose from Gallery",
        onPress: () => {
          void handlePickAvatarFromGallery();
        },
      },
      {
        text: "Randomize",
        onPress: () => {
          const newAvatarUrl = `https://api.dicebear.com/7.x/identicon/png?seed=${Date.now()}&size=256`;
          updateProfile({ avatarUrl: newAvatarUrl });
        },
      },
      {
        text: "Reset Default",
        onPress: () => updateProfile({ avatarUrl: "" }),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View>
      <View style={styles.avatarWrap}>
        <TactilePressable onPress={openAvatarActions}>
          <View
            style={[
              styles.avatarOuterRing,
              {
                backgroundColor: accent + "80",
                shadowColor: accent,
              },
            ]}
          >
            <View style={[styles.avatarInnerRing, { backgroundColor: accent }]}>
              <Avatar alt={profile.name} style={styles.avatar}>
                <Avatar.Image source={{ uri: profile.avatarUrl }} />
                <Avatar.Fallback style={styles.avatarFallback}>
                  <ThemedText style={[styles.fallbackInitials, { color: accent }]}>
                    {profile.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </ThemedText>
                </Avatar.Fallback>
              </Avatar>
              <View style={[styles.editIconWrap, { backgroundColor: accent }]}>
                <IconSymbol name="camera.fill" size={14} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </TactilePressable>
      </View>

      <View style={styles.textWrap}>
        <TactilePressable onPress={openNameEditor} style={styles.namePressable}>
          <ThemedText style={[styles.nameText, { color: foreground }]}>
            {profile.name}
          </ThemedText>
        </TactilePressable>

        <TactilePressable onPress={openTitleEditor} style={styles.titlePressable}>
          <ThemedText style={[styles.titleText, { color: accent }]}>
            {profile.title}
          </ThemedText>
        </TactilePressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarWrap: {
    alignItems: "center",
  },
  avatarOuterRing: {
    padding: 4,
    borderRadius: 9999,
    shadowOpacity: 1,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
  },
  avatarInnerRing: {
    padding: 4,
    borderRadius: 9999,
    borderWidth: 4,
    borderColor: "#000",
    position: "relative",
  },
  avatar: {
    height: 150,
    width: 150,
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackInitials: {
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
    padding: 50,
    marginTop: 25,
  },
  editIconWrap: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#00000066",
  },
  textWrap: {
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  namePressable: {
    marginBottom: 4,
  },
  titlePressable: {
    marginTop: 2,
  },
  nameText: {
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "bold",
  },
  titleText: {
    fontSize: 18,
    textTransform: "uppercase",
  },
});

export default Hero;
