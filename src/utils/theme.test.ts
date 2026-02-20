import {
  getEffectiveTheme,
  themeNameToModeAndPalette,
  type ColorMode,
  type ThemePalette,
} from './theme';

describe('theme', () => {
  describe('getEffectiveTheme', () => {
    it('returns light/dark for default palette', () => {
      expect(getEffectiveTheme('light', 'default')).toBe('light');
      expect(getEffectiveTheme('dark', 'default')).toBe('dark');
    });

    it('returns ocean-light/ocean-dark for ocean palette', () => {
      expect(getEffectiveTheme('light', 'ocean')).toBe('ocean-light');
      expect(getEffectiveTheme('dark', 'ocean')).toBe('ocean-dark');
    });

    it('returns mint-light/mint-dark for mint palette', () => {
      expect(getEffectiveTheme('light', 'mint')).toBe('mint-light');
      expect(getEffectiveTheme('dark', 'mint')).toBe('mint-dark');
    });

    it('returns dark-pro for dark-pro when dark, light when light', () => {
      expect(getEffectiveTheme('dark', 'dark-pro')).toBe('dark-pro');
      expect(getEffectiveTheme('light', 'dark-pro')).toBe('light');
    });

    it('returns light/dark fallback for unknown palette', () => {
      expect(getEffectiveTheme('light', 'unknown' as any)).toBe('light');
      expect(getEffectiveTheme('dark', 'unknown' as any)).toBe('dark');
    });
  });

  describe('themeNameToModeAndPalette', () => {
    it('maps system and light to light/default', () => {
      expect(themeNameToModeAndPalette('system')).toEqual({
        colorMode: 'light',
        themePalette: 'default',
      });
      expect(themeNameToModeAndPalette('light')).toEqual({
        colorMode: 'light',
        themePalette: 'default',
      });
    });

    it('maps dark to dark/default', () => {
      expect(themeNameToModeAndPalette('dark')).toEqual({
        colorMode: 'dark',
        themePalette: 'default',
      });
    });

    it('maps ocean variants', () => {
      expect(themeNameToModeAndPalette('ocean-light')).toEqual({
        colorMode: 'light',
        themePalette: 'ocean',
      });
      expect(themeNameToModeAndPalette('ocean-dark')).toEqual({
        colorMode: 'dark',
        themePalette: 'ocean',
      });
    });

    it('maps mint variants', () => {
      expect(themeNameToModeAndPalette('mint-light')).toEqual({
        colorMode: 'light',
        themePalette: 'mint',
      });
      expect(themeNameToModeAndPalette('mint-dark')).toEqual({
        colorMode: 'dark',
        themePalette: 'mint',
      });
    });

    it('maps dark-pro', () => {
      expect(themeNameToModeAndPalette('dark-pro')).toEqual({
        colorMode: 'dark',
        themePalette: 'dark-pro',
      });
    });

    it('returns dark/default for unknown theme', () => {
      expect(themeNameToModeAndPalette('unknown')).toEqual({
        colorMode: 'dark',
        themePalette: 'default',
      });
    });
  });
});
