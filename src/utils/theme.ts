/**
 * Combines color mode (light/dark/system) with theme palette to produce
 * the Uniwind theme name. Used by _layout and preferences.
 */

export type ColorMode = 'light' | 'dark';
export type ThemePalette = 'default' | 'ocean' | 'mint' | 'dark-pro';

export type UniwindThemeName =
  | 'light'
  | 'dark'
  | 'ocean-light'
  | 'ocean-dark'
  | 'mint-light'
  | 'mint-dark'
  | 'dark-pro';

/**
 * Returns the Uniwind theme name from color mode and theme palette.
 */
export function getEffectiveTheme(
  colorMode: ColorMode,
  themePalette: ThemePalette,
): UniwindThemeName {
  const isDark = colorMode === 'dark';

  if (themePalette === 'default') {
    return colorMode === 'light' ? 'light' : 'dark';
  }
  if (themePalette === 'ocean') {
    return isDark ? 'ocean-dark' : 'ocean-light';
  }
  if (themePalette === 'mint') {
    return isDark ? 'mint-dark' : 'mint-light';
  }
  if (themePalette === 'dark-pro') {
    return isDark ? 'dark-pro' : 'light';
  }
  return colorMode === 'light' ? 'light' : 'dark';
}

/**
 * Migrate legacy themeName to colorMode + themePalette.
 */
export function themeNameToModeAndPalette(
  themeName: string,
): { colorMode: ColorMode; themePalette: ThemePalette } {
  if (themeName === 'system' || themeName === 'light') return { colorMode: 'light', themePalette: 'default' };
  if (themeName === 'dark') return { colorMode: 'dark', themePalette: 'default' };
  if (themeName === 'ocean-light') return { colorMode: 'light', themePalette: 'ocean' };
  if (themeName === 'ocean-dark') return { colorMode: 'dark', themePalette: 'ocean' };
  if (themeName === 'mint-light') return { colorMode: 'light', themePalette: 'mint' };
  if (themeName === 'mint-dark') return { colorMode: 'dark', themePalette: 'mint' };
  if (themeName === 'dark-pro') return { colorMode: 'dark', themePalette: 'dark-pro' };
  return { colorMode: 'dark', themePalette: 'default' };
}
