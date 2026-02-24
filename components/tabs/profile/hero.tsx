import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import useUserStore from "@/store/userStore";
import * as ImagePicker from "expo-image-picker";
import { Avatar, useThemeColor } from "heroui-native";
import { useEffect, useMemo, type ReactNode } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

type TactilePressableProps = {
  onPress: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const ORBIT_CONTAINER_SIZE = 220;

const DATA_STREAM_RING_RADII = [78, 88, 98];
const DATA_STREAM_PARTICLES_PER_RING = 32;
const DATA_STREAM_CHARS = [
  "0", "1", "{", "}", ";", ">", "=>", "(", ")", "<", "-", 
  "_", "/", "[", "]", "@", "#", "$", "%", "^", "&", "*",
  "|", "~", "`", "!", "?", ".", ",", ":", ";", "=", "+",
];
const OUTER_RING_ROTATION_DURATION_MS = 70000;
const DATA_STREAM_FONT_SIZE = 18;
const DATA_STREAM_FONT_SIZE_DOUBLE_CHAR = 12;
const DATA_STREAM_JITTER_AMPLITUDE = 1;
const DATA_STREAM_ROTATION_DURATION_MS = [60000, 80000, 70000];
const DATA_STREAM_ROTATION_DIRECTIONS: (1 | -1)[] = [1, -1, 1];
const DATA_STREAM_BREATH_DURATION_MS = 10000;
const DATA_STREAM_OPACITY_MIN = 0.4;
const DATA_STREAM_OPACITY_MAX = 0.5;
const DATA_STREAM_JITTER_DURATION_MS = 10000;

type ParticleConfig = { angle: number; char: string; seed: number };

function getRingParticles(ringIndex: number): ParticleConfig[] {
  const n = DATA_STREAM_PARTICLES_PER_RING;
  const particles: ParticleConfig[] = [];
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n;
    particles.push({
      angle,
      char: DATA_STREAM_CHARS[Math.floor(Math.random() * DATA_STREAM_CHARS.length)],
      seed: Math.random() * 2 * Math.PI,
    });
  }
  return particles;
}

function useRingParticles() {
  return useMemo(
    () => [
      getRingParticles(0),
      getRingParticles(1),
      getRingParticles(2),
      getRingParticles(3),
      getRingParticles(4),
    ],
    [],
  );
}

function DataStreamParticle({
  radius,
  angle,
  char,
  seed,
  accent,
  jitterPhase,
}: {
  radius: number;
  angle: number;
  char: string;
  seed: number;
  accent: string;
  jitterPhase: SharedValue<number>;
}) {
  const center = radius;
  const baseX = center + radius * Math.cos(angle);
  const baseY = center + radius * Math.sin(angle);

  const jitterStyle = useAnimatedStyle(() => {
    "worklet";
    const phase = jitterPhase.value;
    const jx = DATA_STREAM_JITTER_AMPLITUDE * Math.sin(phase + seed);
    const jy = DATA_STREAM_JITTER_AMPLITUDE * Math.cos(phase + seed * 1.7);
    return {
      transform: [{ translateX: jx }, { translateY: jy }],
    };
  });

  const isDoubleChar = char.length > 1;
  const cellSize = isDoubleChar ? 18 : 16;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: baseX - cellSize / 2,
          top: baseY - cellSize / 2,
          width: cellSize,
          height: cellSize,
          alignItems: "center",
          justifyContent: "center",
        },
        jitterStyle,
      ]}
    >
      <Text
        style={[
          styles.dataStreamChar,
          {
            color: accent,
            fontSize: isDoubleChar ? DATA_STREAM_FONT_SIZE_DOUBLE_CHAR : DATA_STREAM_FONT_SIZE,
            textShadowColor: accent + "80",
            fontFamily: "JetBrainsMono_700Bold",
          },
        ]}
      >
        {char}
      </Text>
    </Animated.View>
  );
}

function DataStreamAura({ accent }: { accent: string }) {
  const ringParticles = useRingParticles();
  const breath = useSharedValue(DATA_STREAM_OPACITY_MIN);
  const jitterPhase = useSharedValue(0);
  const rotation0 = useSharedValue(0);
  const rotation1 = useSharedValue(0);
  const rotation2 = useSharedValue(0);
  const rotationOuter = useSharedValue(0);

  useEffect(() => {
    // Subtle breathing pulse (0.4 → 0.6 over 8s). To make static: set breath.value = 0.5 and remove this block.
    breath.value = withRepeat(
      withSequence(
        withTiming(DATA_STREAM_OPACITY_MAX, {
          duration: DATA_STREAM_BREATH_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(DATA_STREAM_OPACITY_MIN, {
          duration: DATA_STREAM_BREATH_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
    );
    jitterPhase.value = withRepeat(
      withTiming(2 * Math.PI, {
        duration: DATA_STREAM_JITTER_DURATION_MS,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
    rotation0.value = withRepeat(
      withTiming(DATA_STREAM_ROTATION_DIRECTIONS[0] * 2 * Math.PI, {
        duration: DATA_STREAM_ROTATION_DURATION_MS[0],
        easing: Easing.linear,
      }),
      -1,
      false,
    );
    rotation1.value = withRepeat(
      withTiming(DATA_STREAM_ROTATION_DIRECTIONS[1] * 2 * Math.PI, {
        duration: DATA_STREAM_ROTATION_DURATION_MS[1],
        easing: Easing.linear,
      }),
      -1,
      false,
    );
    rotation2.value = withRepeat(
      withTiming(DATA_STREAM_ROTATION_DIRECTIONS[2] * 2 * Math.PI, {
        duration: DATA_STREAM_ROTATION_DURATION_MS[2],
        easing: Easing.linear,
      }),
      -1,
      false,
    );
    rotationOuter.value = withRepeat(
      withTiming(-2 * Math.PI, {
        duration: OUTER_RING_ROTATION_DURATION_MS,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [breath, jitterPhase, rotation0, rotation1, rotation2, rotationOuter]);

  const breathStyle = useAnimatedStyle(() => {
    "worklet";
    return { opacity: breath.value };
  });

  const rotationStyles = [
    useAnimatedStyle(() => {
      "worklet";
      return { transform: [{ rotate: `${rotation0.value}rad` }] };
    }),
    useAnimatedStyle(() => {
      "worklet";
      return { transform: [{ rotate: `${rotation1.value}rad` }] };
    }),
    useAnimatedStyle(() => {
      "worklet";
      return { transform: [{ rotate: `${rotation2.value}rad` }] };
    }),
  ];

  const center = ORBIT_CONTAINER_SIZE / 2;

  return (
    <>
      {DATA_STREAM_RING_RADII.map((radius, ringIndex) => {
        const size = radius * 2;
        const left = center - radius;
        const top = center - radius;
        const particles = ringParticles[ringIndex];
        return (
          <Animated.View
            key={ringIndex}
            style={[
              {
                position: "absolute",
                left,
                top,
                width: size,
                height: size,
              },
              breathStyle,
              rotationStyles[ringIndex],
            ]}
          >
            {particles.map((p, i) => (
              <DataStreamParticle
                key={`${ringIndex}-${i}`}
                radius={radius}
                angle={p.angle}
                char={p.char}
                seed={p.seed}
                accent={accent}
                jitterPhase={jitterPhase}
              />
            ))}
          </Animated.View>
        );
      })}
    </>
  );
}

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
    <View style={styles.heroRoot}>
      <View style={[styles.avatarWrap, { width: ORBIT_CONTAINER_SIZE, height: ORBIT_CONTAINER_SIZE }]}>
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <View style={[StyleSheet.absoluteFill, styles.auraLayer]}>
            <DataStreamAura accent={accent} />
          </View>
        </View>
        <TactilePressable onPress={openAvatarActions}>
          <View
            style={[
              styles.avatarOuterRing
            ]}
          >
            <View style={[styles.avatarInnerRing]}>
              <Avatar alt={profile.name} style={[styles.avatar, { borderColor: accent }]}>
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
  heroRoot: {
    width: "100%",
    alignItems: "center",
  },
  avatarWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  auraLayer: {
    pointerEvents: "none",
  },
  dataStreamChar: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: DATA_STREAM_FONT_SIZE,
    includeFontPadding: false,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  outerDiamond: {
    position: "absolute",
    borderWidth: 1.5,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
    shadowOpacity: 0.9,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  avatarOuterRing: {
    padding: 4,
  },
  avatarInnerRing: {
    padding: 4,
    borderRadius: 9999,
    position: "relative",
  },
  avatar: {
    borderWidth: 2,
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
    bottom: 15,
    right: 15,
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
