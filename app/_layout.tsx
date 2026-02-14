import { JetBrainsMono_400Regular, JetBrainsMono_700Bold, useFonts } from '@expo-google-fonts/jetbrains-mono';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HeroUINativeProvider } from 'heroui-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import useUserStore from '@/store/userStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const isOnboardingCompleted = useUserStore((state) => state.isOnboardingCompleted);

  const [loaded] = useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold
  });

  useEffect(() => {
    if (!loaded) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!isOnboardingCompleted && !inOnboarding) {
      router.replace('/onboarding');
    }

    if (isOnboardingCompleted && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [loaded, isOnboardingCompleted, router, segments]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider
        config={{
          textProps: {
            allowFontScaling: false,
            maxFontSizeMultiplier: 1.2,
          }
        }}
      >
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="quiz/[id]" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="daily/results" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="modals" options={{ headerShown: false,presentation: 'modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
