import {
  getRankNameFromLevel,
  getMaxRankTitleLevel,
  getNextRankNameFromLevel,
  getXpForLevel,
  getLevelFromXp,
  getCurrentLevelBounds,
  type LevelBounds,
} from './rank';

describe('rank', () => {
  describe('getRankNameFromLevel', () => {
    it('returns correct title for level 1', () => {
      expect(getRankNameFromLevel(1)).toBe('Script Kiddie');
    });

    it('returns correct title for level 10', () => {
      expect(getRankNameFromLevel(10)).toBe('Legendary Engineer');
    });

    it('clamps level to valid range', () => {
      expect(getRankNameFromLevel(0)).toBe('Script Kiddie');
      expect(getRankNameFromLevel(100)).toBe('Legendary Engineer');
    });

    it('floors fractional level', () => {
      expect(getRankNameFromLevel(2.7)).toBe('Debug Rookie');
    });
  });

  describe('getMaxRankTitleLevel', () => {
    it('returns 10', () => {
      expect(getMaxRankTitleLevel()).toBe(10);
    });
  });

  describe('getNextRankNameFromLevel', () => {
    it('returns next rank for level 1', () => {
      expect(getNextRankNameFromLevel(1)).toBe('Debug Rookie');
    });

    it('returns null when at max level', () => {
      expect(getNextRankNameFromLevel(10)).toBeNull();
      expect(getNextRankNameFromLevel(11)).toBeNull();
    });
  });

  describe('getXpForLevel', () => {
    it('returns 100 for level 1', () => {
      expect(getXpForLevel(1)).toBe(100);
    });

    it('returns 300 for level 2 (100+200)', () => {
      expect(getXpForLevel(2)).toBe(300);
    });

    it('returns 600 for level 3', () => {
      expect(getXpForLevel(3)).toBe(600);
    });

    it('clamps level to at least 1', () => {
      expect(getXpForLevel(0)).toBe(100);
    });
  });

  describe('getLevelFromXp', () => {
    it('returns 1 for 0 xp', () => {
      expect(getLevelFromXp(0)).toBe(1);
    });

    it('returns 1 for 100 xp', () => {
      expect(getLevelFromXp(100)).toBe(1);
    });

    it('returns 2 for 101 xp', () => {
      expect(getLevelFromXp(101)).toBe(2);
    });

    it('returns 2 for 300 xp', () => {
      expect(getLevelFromXp(300)).toBe(2);
    });

    it('returns 3 for 301 xp', () => {
      expect(getLevelFromXp(301)).toBe(3);
    });

    it('floors xp', () => {
      expect(getLevelFromXp(100.9)).toBe(1);
    });
  });

  describe('getCurrentLevelBounds', () => {
    it('returns correct bounds for 0 xp', () => {
      const bounds = getCurrentLevelBounds(0);
      expect(bounds.level).toBe(1);
      expect(bounds.levelStartXp).toBe(0);
      expect(bounds.levelEndXp).toBe(100);
      expect(bounds.xpIntoLevel).toBe(0);
      expect(bounds.xpRequiredForLevel).toBe(100);
      expect(bounds.progressPercent).toBe(0);
    });

    it('returns correct bounds for 50 xp', () => {
      const bounds = getCurrentLevelBounds(50);
      expect(bounds.level).toBe(1);
      expect(bounds.progressPercent).toBe(50);
    });

    it('returns correct bounds for 100 xp', () => {
      const bounds = getCurrentLevelBounds(100);
      expect(bounds.level).toBe(1);
      expect(bounds.progressPercent).toBe(100);
    });

    it('returns correct bounds for 150 xp (level 2)', () => {
      const bounds = getCurrentLevelBounds(150);
      expect(bounds.level).toBe(2);
      expect(bounds.levelStartXp).toBe(100);
      expect(bounds.levelEndXp).toBe(300);
      expect(bounds.xpIntoLevel).toBe(50);
      expect(bounds.xpRequiredForLevel).toBe(200);
      expect(bounds.progressPercent).toBe(25);
    });
  });
});
