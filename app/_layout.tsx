import { JetBrainsMono_400Regular, JetBrainsMono_700Bold, useFonts } from '@expo-google-fonts/jetbrains-mono';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HeroUINativeProvider } from 'heroui-native';
import { useEffect } from 'react';
import { Uniwind } from 'uniwind';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

import { LevelCompleteModal } from '@/components/path/level-complete-modal';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { preloadSounds } from '@/src/services/audioService';
import { requestPermissions, scheduleDailyReminder } from '@/src/utils/notifications';
import { getEffectiveTheme } from '@/src/utils/theme';
import useUserStore from '@/store/userStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const isOnboardingCompleted = useUserStore((state) => state.isOnboardingCompleted);
  const colorMode = useUserStore((state) => state.settings.colorMode);
  const themePalette = useUserStore((state) => state.settings.themePalette);
  const notificationsEnabled = useUserStore((state) => state.settings.notificationsEnabled);
  const effectiveTheme = getEffectiveTheme(colorMode, themePalette);
  const lastCompletedDate = useUserStore((state) => state.dailyState.lastCompletedDate);
  const syncStreakIntegrity = useUserStore((state) => state.syncStreakIntegrity);
  const levelJustCompleted = useUserStore((state) => state.levelJustCompleted);
  const setLevelJustCompleted = useUserStore((state) => state.setLevelJustCompleted);

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

  useEffect(() => {
    syncStreakIntegrity();

    const appStateListener = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        syncStreakIntegrity();
      }
    });

    return () => {
      appStateListener.remove();
    };
  }, [syncStreakIntegrity]);

  useEffect(() => {
    Uniwind.setTheme(effectiveTheme);
  }, [effectiveTheme]);

  useEffect(() => {
    void preloadSounds();
  }, []);

  useEffect(() => {
    const syncNotificationState = async () => {
      if (notificationsEnabled) {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;
        await scheduleDailyReminder({
          notificationsEnabled,
          lastCompletedDate,
        });
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();
    };

    void syncNotificationState();
  }, [notificationsEnabled, lastCompletedDate]);

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
          <LevelCompleteModal
            level={levelJustCompleted}
            onDismiss={() => setLevelJustCompleted(null)}
          />
          <Stack>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="quiz/[id]" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="pack/[id]" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="daily/results" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="history" options={{ headerShown: false }} />
            <Stack.Screen name="history/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="leaderboard" options={{ headerShown: false }} />
            <Stack.Screen
              name="badges"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="paywall"
              options={{ headerShown: false, presentation: 'modal' }}
            />
            <Stack.Screen name="modals" options={{ headerShown: false,presentation: 'modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
