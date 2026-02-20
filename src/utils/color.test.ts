import { getContrastSafePackColor } from './color';

describe('color', () => {
  describe('getContrastSafePackColor', () => {
    it('returns original hex when isLightTheme is false', () => {
      expect(getContrastSafePackColor('#e9fb61', false)).toBe('#e9fb61');
      expect(getContrastSafePackColor('#ffffff', false)).toBe('#ffffff');
    });

    it('returns darkened hex on light theme for 6-digit hex', () => {
      const result = getContrastSafePackColor('#e9fb61', true);
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
      expect(result).not.toBe('#e9fb61');
    });

    it('returns darkened hex on light theme for 3-digit hex', () => {
      const result = getContrastSafePackColor('#fff', true);
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('returns original hex when input is invalid (light theme)', () => {
      expect(getContrastSafePackColor('nothex', true)).toBe('nothex');
      expect(getContrastSafePackColor('', true)).toBe('');
    });

    it('accepts hex with or without leading #', () => {
      const withHash = getContrastSafePackColor('#abc', true);
      const withoutHash = getContrastSafePackColor('abc', true);
      expect(withHash).toMatch(/^#[0-9a-f]{6}$/);
      expect(withoutHash).toMatch(/^#[0-9a-f]{6}$/);
    });
  });
});
