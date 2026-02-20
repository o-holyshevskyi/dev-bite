import { getLeaderboard, getRandomAvatarUrl, type LeaderboardEntry } from './leaderboard';

describe('leaderboard', () => {
  describe('getRandomAvatarUrl', () => {
    it('returns URL with seed for non-empty string', () => {
      const url = getRandomAvatarUrl('user123');
      expect(url).toContain('api.dicebear.com');
      expect(url).toContain('seed=');
      expect(url).toContain(encodeURIComponent('user123'));
    });

    it('uses "player" when seed is empty string', () => {
      const url = getRandomAvatarUrl('');
      expect(url).toContain(encodeURIComponent('player'));
    });

    it('trims whitespace from seed', () => {
      const url = getRandomAvatarUrl('  abc  ');
      expect(url).toContain(encodeURIComponent('abc'));
    });
  });

  describe('getLeaderboard', () => {
    it('returns array with user entry', () => {
      const result = getLeaderboard(0);
      const userEntry = result.find((e) => e.isUser);
      expect(userEntry).toBeDefined();
      expect(userEntry?.name).toBe('You');
      expect(userEntry?.xp).toBe(0);
      expect(userEntry?.rank).toBeGreaterThanOrEqual(1);
    });

    it('sorts by XP descending', () => {
      const result = getLeaderboard(100);
      for (let i = 1; i < result.length; i++) {
        expect(result[i]!.xp).toBeLessThanOrEqual(result[i - 1]!.xp);
      }
    });

    it('assigns rank 1 to N', () => {
      const result = getLeaderboard(50);
      result.forEach((entry, index) => {
        expect(entry.rank).toBe(index + 1);
      });
    });

    it('user has target rank based on XP', () => {
      const result = getLeaderboard(1000);
      const userEntry = result.find((e) => e.isUser);
      expect(userEntry).toBeDefined();
      expect(userEntry!.rank).toBeGreaterThanOrEqual(5);
      expect(userEntry!.rank).toBeLessThanOrEqual(15);
    });

    it('handles negative XP as 0', () => {
      const result = getLeaderboard(-100);
      const userEntry = result.find((e) => e.isUser);
      expect(userEntry?.xp).toBe(0);
    });

    it('all entries have avatarUrl', () => {
      const result = getLeaderboard(0);
      result.forEach((entry) => {
        expect(entry.avatarUrl).toBeDefined();
        expect(entry.avatarUrl.length).toBeGreaterThan(0);
      });
    });
  });
});
