import * as Notifications from 'expo-notifications';
import { requestPermissions, scheduleDailyReminder } from './notifications';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve()),
  SchedulableTriggerInputTypes: {
    DATE: 'date',
    DAILY: 'daily',
  },
}));

describe('notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPermissions', () => {
    it('returns true when already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
      const result = await requestPermissions();
      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('returns result of request when not granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
      const result = await requestPermissions();
      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('returns false when request is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
      const result = await requestPermissions();
      expect(result).toBe(false);
    });
  });

  describe('scheduleDailyReminder', () => {
    it('cancels all and returns early when notifications disabled', async () => {
      await scheduleDailyReminder({
        notificationsEnabled: false,
        lastCompletedDate: null,
      });
      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('schedules daily trigger when not completed today', async () => {
      await scheduleDailyReminder({
        notificationsEnabled: true,
        lastCompletedDate: null,
        now: new Date('2025-02-20T10:00:00Z'),
      });
      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: expect.objectContaining({ title: expect.any(String), body: expect.any(String) }),
        trigger: {
          type: 'daily',
          hour: 19,
          minute: 0,
        },
      });
    });

    it('schedules date trigger for tomorrow when completed today', async () => {
      await scheduleDailyReminder({
        notificationsEnabled: true,
        lastCompletedDate: '2025-02-20',
        now: new Date('2025-02-20T10:00:00Z'),
      });
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: expect.objectContaining({ title: expect.any(String), body: expect.any(String) }),
        trigger: {
          type: 'date',
          date: expect.any(Date),
        },
      });
      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      const triggerDate = call.trigger.date as Date;
      expect(triggerDate.getDate()).toBe(21);
      expect(triggerDate.getHours()).toBe(19);
    });
  });
});
