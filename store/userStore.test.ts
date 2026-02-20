jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ granted: false })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: false })),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve()),
  SchedulableTriggerInputTypes: { DATE: 'date', DAILY: 'daily' },
}));
import { getStreakStatus } from './userStore';

describe('userStore', () => {
  describe('getStreakStatus', () => {
    it('returns lost when streak is 0', () => {
      expect(getStreakStatus(0, null)).toBe('lost');
      expect(getStreakStatus(0, '2025-01-01')).toBe('lost');
    });

    it('returns lost when lastCompletedDate is null', () => {
      expect(getStreakStatus(5, null)).toBe('lost');
    });

    it('returns safe when lastCompletedDate is today', () => {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const todayKey = `${y}-${m}-${d}`;
      expect(getStreakStatus(3, todayKey)).toBe('safe');
    });

    it('returns atRisk when lastCompletedDate is yesterday', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const y = yesterday.getFullYear();
      const m = String(yesterday.getMonth() + 1).padStart(2, '0');
      const d = String(yesterday.getDate()).padStart(2, '0');
      const yesterdayKey = `${y}-${m}-${d}`;
      expect(getStreakStatus(3, yesterdayKey)).toBe('atRisk');
    });

    it('returns lost when lastCompletedDate is older than yesterday', () => {
      expect(getStreakStatus(5, '2020-01-01')).toBe('lost');
    });

    it('uses provided now for date key', () => {
      const jan1 = new Date('2025-01-01T12:00:00Z');
      const todayKey = '2025-01-01';
      expect(getStreakStatus(1, todayKey, jan1)).toBe('safe');
    });
  });
});
