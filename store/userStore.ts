import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  getAllSnippets,
  getPackById,
  getSnippetWithPackById,
  initialRank,
  quizPacks,
  topicMastery,
  type Difficulty,
} from '@/src/data/mockData';
import {
  getChapterProgressRatio,
  getCurrentDifficultyForCategory,
  isPackInCurrentLearningLevel,
} from '@/src/utils/learning-path';
import { scheduleDailyReminder } from '@/src/utils/notifications';
import { themeNameToModeAndPalette } from '@/src/utils/theme';
import { getCurrentLevelBounds, getRankNameFromLevel } from '@/src/utils/rank';

export interface UserProfile {
  name: string;
  title: string;
  avatarUrl: string;
}

export interface UserStats {
  streakDays: number;
  solved: number;
  accuracy: number; // 0-1
  globalRankTopPercent: number; // e.g. 0.05 = top 5%
}

export interface PackProgress {
  packId: string;
  completedSnippetIds: string[];
  incorrectSnippetIds: string[];
}

export type ColorMode = 'light' | 'dark';
export type ThemePalette = 'default' | 'ocean' | 'mint' | 'dark-pro';

export interface UserSettings {
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
  soundsEnabled: boolean;
  /** @deprecated Use colorMode + themePalette. Kept for migration. */
  theme: 'dark' | 'light' | 'system';
  /** @deprecated Use colorMode + themePalette. Kept for migration. */
  themeName?: string;
  /** Light, dark, or follow device (system). */
  colorMode: ColorMode;
  /** Palette: default (standard) or ocean, mint, dark-pro. Combined with colorMode for Uniwind theme. */
  themePalette: ThemePalette;
}

export type DailyQuestionResult = 0 | 1 | 2; // 0=pending,1=correct,2=wrong

export interface DailyState {
  lastCompletedDate: string | null; // YYYY-MM-DD (local)
  currentSetId: string | null;
  results: [DailyQuestionResult, DailyQuestionResult, DailyQuestionResult];
  isCompleted: boolean;
  questionIds: [string | null, string | null, string | null];
  currentIndex: 0 | 1 | 2;
  lastGeneratedDate: string | null; // YYYY-MM-DD (local)
}

export type ActivityEntry = {
  id: string;
  type: 'daily' | 'pack';
  title: string;
  xpGained: number;
  timestamp: number;
  snippetId?: string;
  userAnswerId?: string;
};

export type MasteryInsight = {
  summary: string;
  focusCategory: string | null;
  focusDifficulty: Difficulty | null;
  strugglingConcept: string | null;
  failureRate: number;
  generatedAt: number;
};

export type PortableUserState = Pick<
  UserStoreState,
  | 'profile'
  | 'stats'
  | 'rank'
  | 'topicMastery'
  | 'packProgress'
  | 'isPro'
  | 'isOnboardingCompleted'
  | 'selectedStack'
  | 'difficulty'
  | 'solvedDailyIds'
  | 'correctlySolvedDailyIds'
  | 'lastStreakDate'
  | 'dailyState'
  | 'activityLog'
  | 'shownAchievementBadgeIds'
  | 'settings'
>;

export type PortableBackupFile = {
  schemaVersion: number;
  exportedAt: string;
  appVersion: number;
  data: PortableUserState;
};

export type StreakStatus = 'safe' | 'atRisk' | 'lost';

const XP_BY_INDEX = [10, 20, 30] as const;
const PERFECT_SET_BONUS = 50;
const PORTABLE_BACKUP_SCHEMA_VERSION = 1;
const MIN_ATTEMPTS_FOR_INSIGHT = 3;
const CONCEPT_PATTERNS: Array<{ label: string; patterns: RegExp[] }> = [
  { label: 'asynchronous concepts', patterns: [/\basync\b/i, /\bawait\b/i, /\bpromise\b/i, /\bconcurr/i] },
  { label: 'type systems', patterns: [/\bgeneric/i, /\btype\b/i, /\binterface\b/i, /\bunion\b/i, /\binfer\b/i] },
  { label: 'state management', patterns: [/\bstate\b/i, /\breducer\b/i, /\bhook/i, /\bstore\b/i, /\bcontext\b/i] },
  { label: 'performance optimization', patterns: [/\bperformance\b/i, /\bcache\b/i, /\bmemo/i, /\blatency\b/i, /\bmemory\b/i] },
  { label: 'data flow', patterns: [/\bapi\b/i, /\brequest\b/i, /\bresponse\b/i, /\bserialize\b/i, /\bjson\b/i] },
];

const LEVEL_TO_DIFFICULTY: Record<string, Difficulty> = {
  Junior: 'easy',
  Mid: 'medium',
  Senior: 'hard',
};

const DIFFICULTY_ORDER: Difficulty[] = [
  'easy',
  'medium',
  'hard',
  'advanced',
  'expert',
  'master',
  'principal',
];

function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getYesterdayLocalDateKey(date = new Date()): string {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateKey(yesterday);
}

function evaluateStreakAfterCompletion(
  lastCompletedDate: string | null,
  currentStreakDays: number,
  today: string,
  yesterday: string,
): number {
  if (lastCompletedDate === today) {
    // Already completed a daily set today; do not inflate streak.
    return Math.max(0, currentStreakDays);
  }

  if (lastCompletedDate === yesterday) {
    return Math.max(0, currentStreakDays) + 1;
  }

  // Broken chain or first ever completion: today's completion starts at 1.
  return 1;
}

function shouldResetStreakForDate(
  lastCompletedDate: string | null,
  today: string,
  yesterday: string,
): boolean {
  if (!lastCompletedDate) return true;
  return lastCompletedDate !== today && lastCompletedDate !== yesterday;
}

export function getStreakStatus(
  streakDays: number,
  lastCompletedDate: string | null,
  now = new Date(),
): StreakStatus {
  const today = getLocalDateKey(now);
  const yesterday = getYesterdayLocalDateKey(now);
  const safeStreak = Math.max(0, streakDays);

  if (safeStreak <= 0 || !lastCompletedDate) return 'lost';
  if (lastCompletedDate === today) return 'safe';
  if (lastCompletedDate === yesterday) return 'atRisk';
  return 'lost';
}

function shiftDifficulty(base: Difficulty, delta: -1 | 0 | 1): Difficulty {
  const currentIndex = DIFFICULTY_ORDER.indexOf(base);
  const nextIndex = Math.min(
    DIFFICULTY_ORDER.length - 1,
    Math.max(0, currentIndex + delta),
  );
  return DIFFICULTY_ORDER[nextIndex];
}

function generateDailyQuestionIds(
  selectedStack: string[],
  level: string,
  correctlySolvedDailyIds: string[],
): [string, string, string] {
  const target = LEVEL_TO_DIFFICULTY[level] ?? 'easy';
  const warmupDifficulty = shiftDifficulty(target, -1);
  const coreDifficulty = shiftDifficulty(target, 0);
  const bossDifficulty = shiftDifficulty(target, 1);
  const all = getAllSnippets();
  const preferredLanguages = selectedStack;
  const stackOnly = all.filter((x) =>
    preferredLanguages.length > 0
      ? preferredLanguages.includes(x.pack.language)
      : x.pack.language !== 'General',
  );
  const solvedSuccessfully = new Set(correctlySolvedDailyIds);
  const unresolvedStackOnly = stackOnly.filter(
    (x) => !solvedSuccessfully.has(x.snippet.id),
  );
  const candidatePool =
    unresolvedStackOnly.length >= 3 ? unresolvedStackOnly : stackOnly;
  const used = new Set<string>();

  const pick = (difficulty: Difficulty): string | null => {
    const byDifficulty = candidatePool.filter(
      (x) =>
        !used.has(x.snippet.id) &&
        x.pack.difficulty === difficulty,
    );
    if (byDifficulty.length > 0) {
      const picked = byDifficulty[Math.floor(Math.random() * byDifficulty.length)];
      used.add(picked.snippet.id);
      return picked.snippet.id;
    }

    // Keep challenges relevant: fallback only within selected stack (any difficulty)
    const fromStackAnyDifficulty = candidatePool.filter((x) => !used.has(x.snippet.id));
    if (fromStackAnyDifficulty.length === 0) return null;
    const picked =
      fromStackAnyDifficulty[
        Math.floor(Math.random() * fromStackAnyDifficulty.length)
      ];
    used.add(picked.snippet.id);
    return picked.snippet.id;
  };

  const q1 = pick(warmupDifficulty) ?? '';
  const q2 = pick(coreDifficulty) ?? q1;
  const q3 = pick(bossDifficulty) ?? q2;
  return [q1, q2, q3];
}

function isDailySetMatchingSelectedStack(
  questionIds: [string | null, string | null, string | null],
  selectedStack: string[],
): boolean {
  if (questionIds.some((id) => !id)) return false;
  if (selectedStack.length === 0) return true;

  return questionIds.every((id) => {
    if (!id) return false;
    const resolved = getSnippetWithPackById(id);
    if (!resolved) return false;
    return selectedStack.includes(resolved.pack.language);
  });
}

function getNormalizedRankFromXp(
  currentRank: typeof initialRank,
  xp: number,
): typeof initialRank {
  const safeXp = Math.max(0, Math.floor(xp));
  const bounds = getCurrentLevelBounds(safeXp);

  return {
    ...currentRank,
    level: bounds.level,
    name: getRankNameFromLevel(bounds.level),
    xp: safeXp,
    xpForNextRank: bounds.levelEndXp,
    progress: bounds.progressPercent / 100,
  };
}

function ensurePackProgressEntries(progress: PackProgress[] | undefined): PackProgress[] {
  const current = progress ?? [];

  return quizPacks.map((pack) => {
    const existing = current.find((p) => p.packId === pack.id);
    return {
      packId: pack.id,
      completedSnippetIds: existing?.completedSnippetIds ?? [],
      incorrectSnippetIds: existing?.incorrectSnippetIds ?? [],
    };
  });
}

function sanitizePackProgressEntries(progress: PackProgress[] | undefined): PackProgress[] {
  const seeded = ensurePackProgressEntries(progress);
  return seeded.map((entry) => ({
    packId: entry.packId,
    completedSnippetIds: Array.from(new Set(entry.completedSnippetIds ?? [])),
    incorrectSnippetIds: Array.from(new Set(entry.incorrectSnippetIds ?? [])),
  }));
}

function sanitizeActivityLogEntries(entries: ActivityEntry[] | undefined): ActivityEntry[] {
  if (!entries || entries.length === 0) return [];
  return entries
    .filter((entry) => !!entry && typeof entry.id === 'string' && typeof entry.timestamp === 'number')
    .map((entry) => ({
      id: entry.id,
      type: (entry.type === 'pack' ? 'pack' : 'daily') as ActivityEntry['type'],
      title: entry.title ?? '',
      xpGained: Number.isFinite(entry.xpGained) ? entry.xpGained : 0,
      timestamp: entry.timestamp,
      snippetId: entry.snippetId,
      userAnswerId: entry.userAnswerId,
    }))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 500);
}

function getPortableStateSnapshot(state: UserStoreState): PortableUserState {
  return {
    profile: state.profile,
    stats: state.stats,
    rank: state.rank,
    topicMastery: state.topicMastery,
    packProgress: state.packProgress,
    isPro: state.isPro,
    isOnboardingCompleted: state.isOnboardingCompleted,
    selectedStack: state.selectedStack,
    difficulty: state.difficulty,
    solvedDailyIds: state.solvedDailyIds,
    correctlySolvedDailyIds: state.correctlySolvedDailyIds,
    lastStreakDate: state.lastStreakDate,
    dailyState: state.dailyState,
    activityLog: state.activityLog,
    shownAchievementBadgeIds: state.shownAchievementBadgeIds,
    settings: state.settings,
  };
}

function normalizeImportedPortableState(payload: unknown): PortableUserState | null {
  if (!payload || typeof payload !== 'object') return null;
  const dataRoot = payload as Partial<PortableBackupFile> & { data?: PortableUserState };
  const rawData =
    dataRoot.data && typeof dataRoot.data === 'object'
      ? dataRoot.data
      : (payload as Partial<PortableUserState>);
  if (!rawData || typeof rawData !== 'object') return null;

  const defaults = createInitialUserData();
  const rawRankXp =
    typeof (rawData.rank as Partial<typeof initialRank> | undefined)?.xp === 'number'
      ? (rawData.rank as Partial<typeof initialRank>).xp!
      : defaults.rank.xp;
  const normalizedRank = getNormalizedRankFromXp(initialRank, rawRankXp);
  const packProgress = sanitizePackProgressEntries(rawData.packProgress);
  const activityLog = sanitizeActivityLogEntries(rawData.activityLog);

  return {
    profile: {
      ...defaults.profile,
      ...(rawData.profile ?? {}),
    },
    stats: {
      ...defaults.stats,
      ...(rawData.stats ?? {}),
    },
    rank: {
      ...normalizedRank,
      ...(rawData.rank ?? {}),
      ...normalizedRank,
    },
    topicMastery: rawData.topicMastery ?? defaults.topicMastery,
    packProgress,
    isPro: rawData.isPro ?? defaults.isPro,
    isOnboardingCompleted: rawData.isOnboardingCompleted ?? defaults.isOnboardingCompleted,
    selectedStack: rawData.selectedStack ?? defaults.selectedStack,
    difficulty: rawData.difficulty ?? defaults.difficulty,
    solvedDailyIds: rawData.solvedDailyIds ?? defaults.solvedDailyIds,
    correctlySolvedDailyIds:
      rawData.correctlySolvedDailyIds ?? defaults.correctlySolvedDailyIds,
    lastStreakDate: rawData.lastStreakDate ?? defaults.lastStreakDate,
    dailyState: rawData.dailyState ?? defaults.dailyState,
    activityLog,
    shownAchievementBadgeIds:
      rawData.shownAchievementBadgeIds ?? defaults.shownAchievementBadgeIds,
    settings: {
      ...defaults.settings,
      ...(rawData.settings ?? {}),
    },
  };
}

function getPreviousDifficulty(difficulty: Difficulty): Difficulty {
  const index = DIFFICULTY_ORDER.indexOf(difficulty);
  if (index <= 0) return difficulty;
  return DIFFICULTY_ORDER[index - 1];
}

function createDefaultMasteryInsight(): MasteryInsight {
  return {
    summary: 'Keep practicing to unlock your first Mastery Insight.',
    focusCategory: null,
    focusDifficulty: null,
    strugglingConcept: null,
    failureRate: 0,
    generatedAt: Date.now(),
  };
}

function buildMasteryInsight(
  activityLog: ActivityEntry[],
  packProgress: PackProgress[],
): MasteryInsight {
  if (activityLog.length === 0) return createDefaultMasteryInsight();
  const attemptsByKey = new Map<string, { category: string; difficulty: Difficulty; attempts: number; failures: number }>();
  const conceptFailures = new Map<string, number>();

  for (const entry of activityLog) {
    if (!entry.snippetId) continue;
    const resolved = getSnippetWithPackById(entry.snippetId);
    if (!resolved) continue;

    const category = resolved.pack.category ?? resolved.pack.language;
    const difficulty = resolved.pack.difficulty;
    const key = `${category}:${difficulty}`;
    const bucket = attemptsByKey.get(key) ?? { category, difficulty, attempts: 0, failures: 0 };
    bucket.attempts += 1;

    const isFailure = entry.title.includes('Incorrect') || entry.title.includes('Attempted');
    if (isFailure) {
      bucket.failures += 1;
      const source = `${resolved.pack.title} ${(resolved.pack.tags ?? []).join(' ')} ${resolved.snippet.question} ${resolved.snippet.code}`;
      for (const concept of CONCEPT_PATTERNS) {
        if (concept.patterns.some((pattern) => pattern.test(source))) {
          conceptFailures.set(concept.label, (conceptFailures.get(concept.label) ?? 0) + 1);
        }
      }
    }
    attemptsByKey.set(key, bucket);
  }

  const candidates = [...attemptsByKey.values()].filter((item) => item.attempts >= MIN_ATTEMPTS_FOR_INSIGHT);
  if (candidates.length === 0) {
    return {
      ...createDefaultMasteryInsight(),
      summary: 'Great consistency. Complete a few more attempts to unlock deeper Mastery Insights.',
    };
  }

  candidates.sort((a, b) => {
    const aRate = a.failures / a.attempts;
    const bRate = b.failures / b.attempts;
    if (bRate !== aRate) return bRate - aRate;
    return b.attempts - a.attempts;
  });

  const focus = candidates[0];
  const failureRate = focus.failures / Math.max(1, focus.attempts);
  const strugglingConcept =
    [...conceptFailures.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'core concepts';
  const currentDifficulty =
    getCurrentDifficultyForCategory(focus.category, packProgress) ?? focus.difficulty;
  const suggestedDifficulty = getPreviousDifficulty(currentDifficulty);

  return {
    summary: `Your ${focus.category} is at ${currentDifficulty.toUpperCase()} level, but you're struggling with ${strugglingConcept}. We recommend revisiting ${suggestedDifficulty.toUpperCase()}/${strugglingConcept} snippets.`,
    focusCategory: focus.category,
    focusDifficulty: currentDifficulty,
    strugglingConcept,
    failureRate,
    generatedAt: Date.now(),
  };
}

export interface UserStoreState {
  profile: UserProfile;
  stats: UserStats;
  rank: typeof initialRank;
  topicMastery: typeof topicMastery;
  packProgress: PackProgress[];
  isPro: boolean;
  isOnboardingCompleted: boolean;
  selectedStack: string[];
  difficulty: string;
  /** IDs of daily challenge questions already solved (for useDailyChallenge filtering) */
  solvedDailyIds: string[];
  /** IDs of daily challenge questions solved correctly at least once */
  correctlySolvedDailyIds: string[];
  /** ISO date string (YYYY-MM-DD) of last day streak was incremented */
  lastStreakDate: string | null;
  dailyState: DailyState;
  activityLog: ActivityEntry[];
  masteryInsight: MasteryInsight;
  /** Set when a level (category + difficulty) just reached 100%; clear when modal is dismissed. */
  levelJustCompleted: { category: string; difficulty: string } | null;
  shownAchievementBadgeIds: string[];
  settings: UserSettings;
  resetStore: () => void;
  setLevelJustCompleted: (value: { category: string; difficulty: string } | null) => void;
  setName: (name: string) => void;
  setTitle: (title: string) => void;
  setAvatarUrl: (avatarUrl: string | null) => void;
  updateProfile: (
    data: Partial<Pick<UserState['profile'], 'name' | 'title' | 'avatarUrl'>>,
  ) => void;
  updatePreferences: (
    prefs: Partial<Pick<UserState, 'difficulty' | 'selectedStack'>>,
  ) => void;
  updateSettings: (newSettings: Partial<UserState['settings']>) => void;
  toggleSounds: () => void;
  updateColorMode: (mode: ColorMode) => void;
  updateThemePalette: (palette: ThemePalette) => void;
  setStack: (stack: string[]) => void;
  setDifficulty: (difficulty: string) => void;
  getCategoryProgress: (categoryId: string) => number;
  unlockPro: () => void;
  completeOnboarding: () => void;
  markSnippetCompleted: (
    packId: string,
    snippetId: string,
    wasCorrect: boolean,
    userAnswerId?: string,
  ) => void;
  markQuestionAsSolved: (id: string) => void;
  addXp: (amount: number) => void;
  incrementStreak: () => void;
  syncStreakIntegrity: () => void;
  markAchievementBadgesSeen: (badgeIds: string[]) => void;
  logActivity: (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;
  getPortableBackup: () => PortableBackupFile;
  importPortableBackup: (payload: unknown) => { ok: boolean; message: string };
  ensureDailySet: () => void;
  submitDailyAnswer: (
    questionId: string,
    isCorrect: boolean,
    userAnswerId?: string,
  ) => { nextQuestionId: string | null; isSetCompleted: boolean };
}

export type UserState = UserStoreState;

function createInitialDailyState(): DailyState {
  return {
    lastCompletedDate: null,
    currentSetId: null,
    results: [0, 0, 0],
    isCompleted: false,
    questionIds: [null, null, null],
    currentIndex: 0,
    lastGeneratedDate: null,
  };
}

function cloneTopicMasteryDefaults(): typeof topicMastery {
  return JSON.parse(JSON.stringify(topicMastery)) as typeof topicMastery;
}

function createInitialUserData(): Pick<
  UserStoreState,
  | 'profile'
  | 'stats'
  | 'rank'
  | 'topicMastery'
  | 'packProgress'
  | 'isPro'
  | 'isOnboardingCompleted'
  | 'selectedStack'
  | 'difficulty'
  | 'settings'
  | 'solvedDailyIds'
  | 'correctlySolvedDailyIds'
  | 'lastStreakDate'
  | 'dailyState'
  | 'activityLog'
  | 'masteryInsight'
  | 'levelJustCompleted'
  | 'shownAchievementBadgeIds'
> {
  const packProgress = ensurePackProgressEntries([]);
  return {
    profile: {
      name: 'Alex Chen',
      title: 'Senior Architect',
      avatarUrl: '',
    },
    stats: {
      streakDays: 0,
      solved: 0,
      accuracy: 0.0,
      globalRankTopPercent: 1,
    },
    rank: { ...initialRank },
    topicMastery: cloneTopicMasteryDefaults(),
    packProgress,
    isPro: false,
    isOnboardingCompleted: false,
    selectedStack: [],
    difficulty: '',
    settings: {
      notificationsEnabled: true,
      hapticsEnabled: true,
      soundsEnabled: true,
      theme: 'dark',
      colorMode: 'dark' as ColorMode,
      themePalette: 'default' as ThemePalette,
    },
    solvedDailyIds: [],
    correctlySolvedDailyIds: [],
    lastStreakDate: null,
    dailyState: createInitialDailyState(),
    activityLog: [],
    masteryInsight: buildMasteryInsight([], packProgress),
    levelJustCompleted: null,
    shownAchievementBadgeIds: [],
  };
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      ...createInitialUserData(),
      resetStore: () =>
        set(() => ({
          ...createInitialUserData(),
        })),
      setLevelJustCompleted: (value) =>
        set(() => ({ levelJustCompleted: value })),
      setName: (name: string) =>
        set((state) => ({
          profile: {
            ...state.profile,
            name,
          },
        })),
      setTitle: (title: string) =>
        set((state) => ({
          profile: {
            ...state.profile,
            title,
          },
        })),
      setAvatarUrl: (avatarUrl: string | null) =>
        set((state) => ({
          profile: {
            ...state.profile,
            avatarUrl: avatarUrl ?? state.profile.avatarUrl,
          },
        })),
      updateProfile: (data) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...data,
          },
        })),
      updatePreferences: (prefs) =>
        set((state) => ({
          difficulty: prefs.difficulty ?? state.difficulty,
          selectedStack: prefs.selectedStack ?? state.selectedStack,
        })),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        })),
      toggleSounds: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            soundsEnabled: !state.settings.soundsEnabled,
          },
        })),
      updateColorMode: (mode) =>
        set((state) => ({
          settings: {
            ...state.settings,
            colorMode: mode,
          },
        })),
      updateThemePalette: (palette) =>
        set((state) => ({
          settings: {
            ...state.settings,
            themePalette: palette,
          },
        })),
      setStack: (stack: string[]) =>
        set(() => ({
          selectedStack: stack,
          dailyState: {
            lastCompletedDate: null,
            currentSetId: null,
            results: [0, 0, 0],
            isCompleted: false,
            questionIds: [null, null, null],
            currentIndex: 0,
            lastGeneratedDate: null,
          },
        })),
      setDifficulty: (difficulty: string) =>
        set(() => ({
          difficulty,
          dailyState: {
            lastCompletedDate: null,
            currentSetId: null,
            results: [0, 0, 0],
            isCompleted: false,
            questionIds: [null, null, null],
            currentIndex: 0,
            lastGeneratedDate: null,
          },
        })),
      getCategoryProgress: (categoryId: string) => {
        const normalizedCategoryId = categoryId.trim().toLowerCase();
        if (!normalizedCategoryId) return 0;

        const state = get();
        const packsInCategory = quizPacks.filter(
          (pack) => pack.category.trim().toLowerCase() === normalizedCategoryId,
        );
        const categorySnippetIds = new Set(
          packsInCategory.flatMap((pack) => pack.snippets.map((snippet) => snippet.id)),
        );
        const totalSnippets = categorySnippetIds.size;
        if (totalSnippets === 0) return 0;

        const completedCount = new Set(
          state.packProgress.flatMap((progress) =>
            progress.completedSnippetIds.filter((snippetId) =>
              categorySnippetIds.has(snippetId),
            ),
          ),
        ).size;

        const progress = (completedCount / totalSnippets) * 100;
        return Math.min(100, Math.max(0, progress));
      },
      unlockPro: () =>
        set(() => ({
          isPro: true,
        })),
      completeOnboarding: () =>
        set(() => ({
          isOnboardingCompleted: true,
        })),
      markSnippetCompleted: (packId, snippetId, wasCorrect, userAnswerId) => {
        const state = get();
        const normalizedPackProgress = ensurePackProgressEntries(state.packProgress);
        const isCurrentLearningLevel = isPackInCurrentLearningLevel(
          packId,
          normalizedPackProgress,
        );
        const hasPackEntry = normalizedPackProgress.some((p) => p.packId === packId);
        const baseProgress = hasPackEntry
          ? normalizedPackProgress
          : [
              ...normalizedPackProgress,
              { packId, completedSnippetIds: [], incorrectSnippetIds: [] },
            ];
        const existing = baseProgress.find((p) => p.packId === packId);
        const alreadyCompleted = existing?.completedSnippetIds.includes(snippetId);
        const isFirstTimeCompletion = !alreadyCompleted;
        const alreadyIncorrect = existing?.incorrectSnippetIds.includes(snippetId);

        const updatedPackProgress = !isCurrentLearningLevel
          ? baseProgress
          : baseProgress.map((p) => {
              if (p.packId !== packId) return p;

              if (wasCorrect) {
                return {
                  ...p,
                  completedSnippetIds: alreadyCompleted
                    ? p.completedSnippetIds
                    : [...p.completedSnippetIds, snippetId],
                  incorrectSnippetIds: p.incorrectSnippetIds.filter((id) => id !== snippetId),
                };
              }

              return {
                ...p,
                completedSnippetIds: p.completedSnippetIds,
                incorrectSnippetIds: alreadyIncorrect
                  ? p.incorrectSnippetIds
                  : [...p.incorrectSnippetIds, snippetId],
              };
            });

        const shouldAwardPracticeXp = wasCorrect && isFirstTimeCompletion && isCurrentLearningLevel;
        const solvedDelta = shouldAwardPracticeXp ? 1 : 0;
        const practiceXpGain = shouldAwardPracticeXp ? 5 : 0;
        const nextRank =
          practiceXpGain > 0
            ? getNormalizedRankFromXp(state.rank, state.rank.xp + practiceXpGain)
            : state.rank;

        let levelJustCompleted: { category: string; difficulty: string } | null = null;
        if (isCurrentLearningLevel) {
          const pack = getPackById(packId);
          if (pack) {
            const category = pack.category ?? pack.language;
            const difficulty = pack.difficulty;
            const beforeRatio = getChapterProgressRatio(category, difficulty, baseProgress);
            const afterRatio = getChapterProgressRatio(category, difficulty, updatedPackProgress);
            if (beforeRatio < 1 && afterRatio >= 1) {
              levelJustCompleted = { category, difficulty };
            }
          }
        }

        set({
          rank: nextRank,
          stats: {
            ...state.stats,
            solved: state.stats.solved + solvedDelta,
            accuracy: state.stats.accuracy,
          },
          packProgress: updatedPackProgress,
          masteryInsight: buildMasteryInsight(state.activityLog, updatedPackProgress),
          levelJustCompleted: levelJustCompleted ?? state.levelJustCompleted,
        });

        get().logActivity({
          type: 'pack',
          title: wasCorrect ? 'Practice Snippet Solved' : 'Practice Snippet Attempted',
          xpGained: practiceXpGain,
          snippetId,
          userAnswerId,
        });
      },
      markQuestionAsSolved: (id: string) => {
        const state = get();
        const ids = state.solvedDailyIds ?? [];
        if (ids.includes(id)) return;
        set({ solvedDailyIds: [...ids, id] });
      },
      addXp: (amount: number) => {
        const state = get();
        const nextXp = state.rank.xp + amount;
        set({
          rank: getNormalizedRankFromXp(state.rank, nextXp),
        });
      },
      logActivity: (entry) => {
        const now = Date.now();
        set((state) => {
          const nextEntry = {
            ...entry,
            id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: now,
          };
          const nextActivityLog = [nextEntry, ...state.activityLog].slice(0, 50);
          return {
            activityLog: nextActivityLog,
            masteryInsight: buildMasteryInsight(
              nextActivityLog,
              state.packProgress,
            ),
          };
        });
      },
      getPortableBackup: () => {
        const snapshot = getPortableStateSnapshot(get());
        return {
          schemaVersion: PORTABLE_BACKUP_SCHEMA_VERSION,
          exportedAt: new Date().toISOString(),
          appVersion: 8,
          data: snapshot,
        };
      },
      importPortableBackup: (payload) => {
        const normalized = normalizeImportedPortableState(payload);
        if (!normalized) {
          return {
            ok: false,
            message: 'Invalid backup file format.',
          };
        }
        set({
          ...normalized,
          masteryInsight: buildMasteryInsight(
            normalized.activityLog,
            normalized.packProgress,
          ),
        });
        return {
          ok: true,
          message: 'Backup imported successfully.',
        };
      },
      incrementStreak: () => {
        const state = get();
        const today = getLocalDateKey();
        if (state.lastStreakDate === today) return;
        set({
          stats: {
            ...state.stats,
            streakDays: state.stats.streakDays + 1,
          },
          lastStreakDate: today,
        });
      },
      syncStreakIntegrity: () => {
        const state = get();
        const today = getLocalDateKey();
        const yesterday = getYesterdayLocalDateKey();
        const needsReset = shouldResetStreakForDate(
          state.dailyState.lastCompletedDate,
          today,
          yesterday,
        );
        if (!needsReset || state.stats.streakDays === 0) return;

        set({
          stats: {
            ...state.stats,
            streakDays: 0,
          },
        });
      },
      markAchievementBadgesSeen: (badgeIds) => {
        if (badgeIds.length === 0) return;
        set((state) => {
          const current = state.shownAchievementBadgeIds ?? [];
          const merged = Array.from(new Set([...current, ...badgeIds]));
          return {
            shownAchievementBadgeIds: merged,
          };
        });
      },
      ensureDailySet: () => {
        const state = get();
        const today = getLocalDateKey();
        const yesterday = getYesterdayLocalDateKey();

        if (
          shouldResetStreakForDate(state.dailyState.lastCompletedDate, today, yesterday) &&
          state.stats.streakDays > 0
        ) {
          set({
            stats: {
              ...state.stats,
              streakDays: 0,
            },
          });
        }

        if (
          state.dailyState.lastGeneratedDate === today &&
          state.dailyState.questionIds.every((id) => !!id) &&
          isDailySetMatchingSelectedStack(
            state.dailyState.questionIds,
            state.selectedStack,
          )
        ) {
          return;
        }

        const questionIds = generateDailyQuestionIds(
          state.selectedStack,
          state.difficulty,
          state.correctlySolvedDailyIds,
        );
        const currentSetId = `${today}:${questionIds.join('|')}`;

        set({
          dailyState: {
            ...state.dailyState,
            currentSetId,
            questionIds,
            results: [0, 0, 0],
            isCompleted: false,
            currentIndex: 0,
            lastGeneratedDate: today,
          },
        });
      },
      submitDailyAnswer: (questionId, isCorrect, userAnswerId) => {
        const state = get();
        const normalizedPackProgress = ensurePackProgressEntries(state.packProgress);
        const today = getLocalDateKey();
        const yesterday = getYesterdayLocalDateKey();
        const questionIndex = state.dailyState.questionIds.findIndex(
          (id) => id === questionId,
        );

        const safeIndex =
          questionIndex >= 0 ? questionIndex : state.dailyState.currentIndex;

        // Already answered, do not award again.
        if (state.dailyState.results[safeIndex] !== 0) {
          const maybeNext = state.dailyState.questionIds[safeIndex + 1] ?? null;
          return {
            nextQuestionId: maybeNext,
            isSetCompleted: state.dailyState.isCompleted,
          };
        }

        const nextResults = [...state.dailyState.results] as DailyState['results'];
        nextResults[safeIndex] = isCorrect ? 1 : 2;
        const resolved = getSnippetWithPackById(questionId);
        const packId = resolved?.pack.id ?? null;
        const isCurrentLearningLevel =
          packId !== null
            ? isPackInCurrentLearningLevel(packId, normalizedPackProgress)
            : false;

        const nextPackProgress =
          packId === null || !isCurrentLearningLevel
            ? normalizedPackProgress
            : normalizedPackProgress.map((pack) => {
                if (pack.packId !== packId) return pack;
                const alreadyCompleted = pack.completedSnippetIds.includes(questionId);
                const alreadyIncorrect = pack.incorrectSnippetIds.includes(questionId);

                if (isCorrect) {
                  return {
                    ...pack,
                    completedSnippetIds: alreadyCompleted
                      ? pack.completedSnippetIds
                      : [...pack.completedSnippetIds, questionId],
                    incorrectSnippetIds: pack.incorrectSnippetIds.filter(
                      (id) => id !== questionId,
                    ),
                  };
                }

                if (alreadyIncorrect) return pack;

                return {
                  ...pack,
                  completedSnippetIds: pack.completedSnippetIds,
                  incorrectSnippetIds: [...pack.incorrectSnippetIds, questionId],
                };
              });

        const solvedIds = state.solvedDailyIds.includes(questionId)
          ? state.solvedDailyIds
          : [...state.solvedDailyIds, questionId];
        const correctlySolvedIds = isCorrect
          ? state.correctlySolvedDailyIds.includes(questionId)
            ? state.correctlySolvedDailyIds
            : [...state.correctlySolvedDailyIds, questionId]
          : state.correctlySolvedDailyIds;
        const prevSolved = Math.max(0, state.stats.solved);
        const prevCorrect = Math.max(0, Math.round(state.stats.accuracy * prevSolved));
        const nextSolved = prevSolved + 1;
        const nextCorrect = prevCorrect + (isCorrect ? 1 : 0);
        const nextAccuracy =
          nextSolved > 0 ? Math.max(0, Math.min(1, nextCorrect / nextSolved)) : 0;

        const xpGain = isCorrect ? XP_BY_INDEX[safeIndex] : 0;
        const rank = getNormalizedRankFromXp(state.rank, state.rank.xp + xpGain);

        const nextQuestionId = state.dailyState.questionIds[safeIndex + 1] ?? null;
        const completed = safeIndex >= 2;

        get().logActivity({
          type: 'daily',
          title: isCorrect ? 'Daily Question Correct' : 'Daily Question Incorrect',
          xpGained: xpGain,
          snippetId: questionId,
          userAnswerId,
        });
        const activityLogWithCurrentEntry = get().activityLog;

        let levelJustCompleted: { category: string; difficulty: string } | null = null;
        if (packId && isCurrentLearningLevel) {
          const pack = getPackById(packId);
          if (pack) {
            const category = pack.category ?? pack.language;
            const difficulty = pack.difficulty;
            const beforeRatio = getChapterProgressRatio(category, difficulty, normalizedPackProgress);
            const afterRatio = getChapterProgressRatio(category, difficulty, nextPackProgress);
            if (beforeRatio < 1 && afterRatio >= 1) {
              levelJustCompleted = { category, difficulty };
            }
          }
        }

        if (!completed) {
          set({
            rank,
            solvedDailyIds: solvedIds,
            correctlySolvedDailyIds: correctlySolvedIds,
            packProgress: nextPackProgress,
            masteryInsight: buildMasteryInsight(
              activityLogWithCurrentEntry,
              nextPackProgress,
            ),
            levelJustCompleted: levelJustCompleted ?? state.levelJustCompleted,
            stats: {
              ...state.stats,
              solved: nextSolved,
              accuracy: nextAccuracy,
            },
            dailyState: {
              ...state.dailyState,
              results: nextResults,
              currentIndex: (safeIndex + 1) as 0 | 1 | 2,
            },
          });
          return { nextQuestionId, isSetCompleted: false };
        }

        const perfect = nextResults.every((r) => r === 1);
        const rankWithBonus = perfect
          ? getNormalizedRankFromXp(rank, rank.xp + PERFECT_SET_BONUS)
          : rank;
        const dailyXp = nextResults.reduce<number>((sum, result, index) => {
          if (result !== 1) return sum;
          return sum + XP_BY_INDEX[index];
        }, 0);
        const totalDailyXp = dailyXp + (perfect ? PERFECT_SET_BONUS : 0);

        const streakDays = evaluateStreakAfterCompletion(
          state.dailyState.lastCompletedDate,
          state.stats.streakDays,
          today,
          yesterday,
        );

        set({
          rank: rankWithBonus,
          solvedDailyIds: solvedIds,
          correctlySolvedDailyIds: correctlySolvedIds,
          packProgress: nextPackProgress,
          masteryInsight: buildMasteryInsight(
            activityLogWithCurrentEntry,
            nextPackProgress,
          ),
          levelJustCompleted: levelJustCompleted ?? state.levelJustCompleted,
          stats: {
            ...state.stats,
            solved: nextSolved,
            accuracy: nextAccuracy,
            streakDays,
          },
          dailyState: {
            ...state.dailyState,
            results: nextResults,
            currentIndex: 2,
            isCompleted: true,
            lastCompletedDate: today,
          },
        });

        get().logActivity({
          type: 'daily',
          title: 'Daily Challenge Completed',
          xpGained: totalDailyXp,
          snippetId: questionId,
          userAnswerId,
        });

        void scheduleDailyReminder({
          notificationsEnabled: state.settings.notificationsEnabled,
          lastCompletedDate: today,
        }).catch(() => {
          // Ignore scheduling failures to keep quiz completion responsive.
        });

        return { nextQuestionId: null, isSetCompleted: true };
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 10,
      migrate: (persistedState: unknown) => {
        const state = (persistedState ?? {}) as Partial<UserStoreState> & {
          rank?: Partial<typeof initialRank>;
        };
        const persistedXp =
          typeof state.rank?.xp === 'number' ? state.rank.xp : initialRank.xp;
        const normalizedRank = getNormalizedRankFromXp(initialRank, persistedXp);

        const normalizedPackProgress = sanitizePackProgressEntries(state.packProgress);
        const normalizedActivityLog = sanitizeActivityLogEntries(state.activityLog);
        return {
          ...state,
          rank: {
            ...normalizedRank,
            ...(state.rank ?? {}),
            ...normalizedRank,
          },
          packProgress: normalizedPackProgress,
          correctlySolvedDailyIds: state.correctlySolvedDailyIds ?? [],
          activityLog: normalizedActivityLog,
          masteryInsight: buildMasteryInsight(
            normalizedActivityLog,
            normalizedPackProgress,
          ),
          shownAchievementBadgeIds: state.shownAchievementBadgeIds ?? [],
          settings: (() => {
            const prev = state.settings ?? {};
            const legacy = prev.themeName ?? prev.theme;
            const { colorMode, themePalette } =
              typeof legacy === 'string'
                ? themeNameToModeAndPalette(legacy)
                  : {
                    colorMode: (prev.colorMode ?? 'dark') as ColorMode,
                    themePalette: (prev.themePalette ?? 'default') as ThemePalette,
                  };
            return {
              notificationsEnabled: true,
              hapticsEnabled: true,
              soundsEnabled: prev.soundsEnabled ?? true,
              theme: 'dark',
              colorMode,
              themePalette,
              ...prev,
            };
          })(),
          isPro: state.isPro ?? false,
        } as UserStoreState;
      },
      partialize: (state) => ({
        profile: state.profile,
        isPro: state.isPro,
        isOnboardingCompleted: state.isOnboardingCompleted,
        selectedStack: state.selectedStack,
        difficulty: state.difficulty,
        rank: state.rank,
        stats: state.stats,
        packProgress: state.packProgress,
        solvedDailyIds: state.solvedDailyIds,
        correctlySolvedDailyIds: state.correctlySolvedDailyIds,
        lastStreakDate: state.lastStreakDate,
        dailyState: state.dailyState,
        activityLog: state.activityLog,
        masteryInsight: state.masteryInsight,
        shownAchievementBadgeIds: state.shownAchievementBadgeIds,
        settings: state.settings,
      }),
    },
  ),
);

export default useUserStore;

