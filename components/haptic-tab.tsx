import useUserStore from '@/store/userStore';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  const hapticsEnabled = useUserStore((state) => state.settings.hapticsEnabled);

  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (hapticsEnabled && process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
