/**
 * Legacy theme color hook (device light/dark only).
 * Prefer HeroUI Native's useThemeColor from 'heroui-native' for semantic colors
 * that respect Uniwind themes (Ocean, Mint, Dark Pro, etc.).
 *
 * @deprecated Use `useThemeColor('foreground' | 'muted' | 'accent' | …)` from 'heroui-native' instead.
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
