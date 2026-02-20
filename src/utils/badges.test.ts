import {
  getBadgesWithUnlockState,
  getUnlockedBadges,
  getLockedBadges,
  BADGE_DEFINITIONS,
} from './badges';
import type { UserState } from '@/store/userStore';

function makeState(overrides: Partial<UserState> = {}): UserState {
  return {
    profile: { name: '', title: '', avatarUrl: '' },
    stats: { streakDays: 0, solved: 0, accuracy: 0, globalRankTopPercent: 1 },
    rank: { level: 1, name: '', description: '', progress: 0, xp: 0, xpForNextRank: 100 },
    topicMastery: [],
    packProgress: [],
    isPro: false,
    isOnboardingCompleted: false,
    selectedStack: [],
    difficulty: '',
    solvedDailyIds: [],
    correctlySolvedDailyIds: [],
    lastStreakDate: null,
    dailyState: {
      lastCompletedDate: null,
      currentSetId: null,
      results: [0, 0, 0],
      isCompleted: false,
      questionIds: [null, null, null],
      currentIndex: 0,
      lastGeneratedDate: null,
    },
    activityLog: [],
    masteryInsight: {
      summary: '',
      focusCategory: null,
      focusDifficulty: null,
      strugglingConcept: null,
      failureRate: 0,
      generatedAt: 0,
    },
    levelJustCompleted: null,
    shownAchievementBadgeIds: [],
    settings: {
      notificationsEnabled: true,
      hapticsEnabled: true,
      soundsEnabled: true,
      theme: 'dark',
      colorMode: 'dark',
      themePalette: 'default',
    },
    resetStore: () => {},
    setLevelJustCompleted: () => {},
    setName: () => {},
    setTitle: () => {},
    setAvatarUrl: () => {},
    updateProfile: () => {},
    updatePreferences: () => {},
    updateSettings: () => {},
    toggleSounds: () => {},
    updateColorMode: () => {},
    updateThemePalette: () => {},
    setStack: () => {},
    setDifficulty: () => {},
    getCategoryProgress: () => 0,
    unlockPro: () => {},
    completeOnboarding: () => {},
    markSnippetCompleted: () => {},
    markQuestionAsSolved: () => {},
    addXp: () => {},
    incrementStreak: () => {},
    syncStreakIntegrity: () => {},
    markAchievementBadgesSeen: () => {},
    logActivity: () => {},
    getPortableBackup: () => ({} as any),
    importPortableBackup: () => ({ ok: false, message: '' }),
    ensureDailySet: () => {},
    submitDailyAnswer: () => ({ nextQuestionId: null, isSetCompleted: false }),
    ...overrides,
  } as UserState;
}

describe('badges', () => {
  describe('getBadgesWithUnlockState', () => {
    it('returns all badges with isUnlocked false when no progress', () => {
      const state = makeState();
      const result = getBadgesWithUnlockState(state);
      expect(result.length).toBe(BADGE_DEFINITIONS.length);
      result.forEach((b) => expect(b.isUnlocked).toBe(false));
    });

    it('unlocks first-blood when solved >= 1', () => {
      const state = makeState({ stats: { streakDays: 0, solved: 1, accuracy: 1, globalRankTopPercent: 1 } });
      const result = getBadgesWithUnlockState(state);
      const firstBlood = result.find((b) => b.id === 'first-blood');
      expect(firstBlood?.isUnlocked).toBe(true);
    });

    it('unlocks streak badges when streakDays >= threshold', () => {
      const state = makeState({ stats: { streakDays: 7, solved: 0, accuracy: 0, globalRankTopPercent: 1 } });
      const result = getBadgesWithUnlockState(state);
      const firebird = result.find((b) => b.id === 'firebird');
      expect(firebird?.isUnlocked).toBe(true);
    });

    it('unlocks XP badges when rank.xp >= threshold', () => {
      const state = makeState({
        rank: { level: 1, name: '', description: '', progress: 0, xp: 500, xpForNextRank: 1000 },
      } as any);
      const result = getBadgesWithUnlockState(state);
      const challenger = result.find((b) => b.id === 'challenger');
      expect(challenger?.isUnlocked).toBe(true);
    });

    it('getProgressLabel returns correct format', () => {
      const state = makeState({ stats: { streakDays: 2, solved: 5, accuracy: 0.8, globalRankTopPercent: 0.1 } });
      const result = getBadgesWithUnlockState(state);
      const streakStarter = result.find((b) => b.id === 'streak-starter');
      expect(streakStarter?.getProgressLabel(state)).toBe('2/3 days');
    });

    it('unlocks explorer when at least one pack has progress', () => {
      const state = makeState({
        packProgress: [
          { packId: 'p1', completedSnippetIds: ['s1'], incorrectSnippetIds: [] },
        ] as any,
      });
      const result = getBadgesWithUnlockState(state);
      const explorer = result.find((b) => b.id === 'explorer');
      expect(explorer?.isUnlocked).toBe(true);
    });

    it('unlocks polyglot when 3+ packs have progress', () => {
      const state = makeState({
        packProgress: [
          { packId: 'p1', completedSnippetIds: ['s1'], incorrectSnippetIds: [] },
          { packId: 'p2', completedSnippetIds: [], incorrectSnippetIds: ['s2'] },
          { packId: 'p3', completedSnippetIds: ['s3'], incorrectSnippetIds: [] },
        ] as any,
      });
      const result = getBadgesWithUnlockState(state);
      const polyglot = result.find((b) => b.id === 'polyglot');
      expect(polyglot?.isUnlocked).toBe(true);
    });
  });

  describe('getUnlockedBadges', () => {
    it('returns only unlocked badges', () => {
      const state = makeState({ stats: { streakDays: 0, solved: 10, accuracy: 1, globalRankTopPercent: 1 } });
      const unlocked = getUnlockedBadges(state);
      expect(unlocked.length).toBeGreaterThan(0);
      unlocked.forEach((b) => expect(b.isUnlocked).toBe(true));
    });
  });

  describe('getLockedBadges', () => {
    it('returns only locked badges', () => {
      const state = makeState({ stats: { streakDays: 0, solved: 1, accuracy: 1, globalRankTopPercent: 1 } });
      const locked = getLockedBadges(state);
      expect(locked.length).toBeGreaterThan(0);
      locked.forEach((b) => expect(b.isUnlocked).toBe(false));
    });
  });
});
