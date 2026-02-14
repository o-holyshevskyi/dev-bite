import * as Notifications from 'expo-notifications';

type ReminderMessage = {
  title: string;
  body: string;
};

type ScheduleDailyReminderOptions = {
  notificationsEnabled: boolean;
  lastCompletedDate: string | null;
  now?: Date;
};

const REMINDER_MESSAGES: ReminderMessage[] = [
  {
    title: 'Keep the streak alive!',
    body: 'Spend 1 minute to solve a challenge and grow your dev skills.',
  },
  {
    title: "Don't let your streak cool down!",
    body: 'A quick daily challenge keeps your momentum strong.',
  },
  {
    title: 'Your daily dev bite is ready!',
    body: 'Open DevBite and complete today’s challenge in under a minute.',
  },
  {
    title: 'Small step, big streak.',
    body: 'Answer one challenge now and keep your progress rolling.',
  },
];

function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTomorrowAtSevenPm(now: Date): Date {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);
  return tomorrow;
}

function pickReminderMessage(): ReminderMessage {
  const index = Math.floor(Math.random() * REMINDER_MESSAGES.length);
  return REMINDER_MESSAGES[index];
}

export async function requestPermissions(): Promise<boolean> {
  const existingPermissions = await Notifications.getPermissionsAsync();

  if (existingPermissions.granted) {
    return true;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync();
  return requestedPermissions.granted;
}

export async function scheduleDailyReminder({
  notificationsEnabled,
  lastCompletedDate,
  now = new Date(),
}: ScheduleDailyReminderOptions): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!notificationsEnabled) {
    return;
  }

  const message = pickReminderMessage();
  const today = getLocalDateKey(now);
  const isCompletedToday = lastCompletedDate === today;

  if (isCompletedToday) {
    await Notifications.scheduleNotificationAsync({
      content: message,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: getTomorrowAtSevenPm(now),
      },
    });
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: message,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 19,
      minute: 0,
    },
  });
}
