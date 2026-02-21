import { Colors, Fonts } from './theme';

describe('constants/theme', () => {
  describe('Colors', () => {
    it('has light and dark themes', () => {
      expect(Colors.light).toBeDefined();
      expect(Colors.dark).toBeDefined();
    });

    it('light theme has required keys', () => {
      expect(Colors.light).toMatchObject({
        text: expect.any(String),
        background: expect.any(String),
        tint: expect.any(String),
        icon: expect.any(String),
        tabIconDefault: expect.any(String),
        tabIconSelected: expect.any(String),
      });
    });

    it('dark theme has required keys', () => {
      expect(Colors.dark).toMatchObject({
        text: expect.any(String),
        background: expect.any(String),
        tint: expect.any(String),
        icon: expect.any(String),
        tabIconDefault: expect.any(String),
        tabIconSelected: expect.any(String),
      });
    });
  });

  describe('Fonts', () => {
    it('has font keys', () => {
      expect(Fonts).toBeDefined();
      const fonts = Fonts as Record<string, string>;
      expect(fonts.sans).toBeDefined();
      expect(fonts.serif).toBeDefined();
      expect(fonts.mono).toBeDefined();
    });
  });
});
