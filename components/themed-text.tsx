import { StyleSheet, Text, type TextProps } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from 'heroui-native';
import { useUniwind } from 'uniwind';

export type ThemedTextProps = TextProps & {
  /** Optional override for light-ish themes (light, ocean-light, mint-light, system+light). */
  lightColor?: string;
  /** Optional override for dark-ish themes (dark, ocean-dark, mint-dark, dark-pro, system+dark). */
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const foreground = useThemeColor('foreground');
  const { theme, hasAdaptiveThemes } = useUniwind();
  const colorScheme = useColorScheme();
  const isDark =
    theme === 'dark' ||
    theme === 'dark-pro' ||
    theme.endsWith('-dark') ||
    (hasAdaptiveThemes && colorScheme === 'dark');
  const override = isDark ? darkColor : lightColor;
  const color = override ?? foreground;

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      allowFontScaling={false}
      maxFontSizeMultiplier={1.0}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
  },
});
