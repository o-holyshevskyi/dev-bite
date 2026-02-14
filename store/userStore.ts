import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  getAllSnippets,
  getSnippetWithPackById,
  initialRank,
  quizPacks,
  topicMastery,
  type Difficulty,
} from '@/src/data/mockData';
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

export interface UserSettings {
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
  theme: 'dark' | 'light' | 'system';
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
};

export type StreakStatus = 'safe' | 'atRisk' | 'lost';

const XP_BY_INDEX = [10, 20, 30] as const;
const PERFECT_SET_BONUS = 50;

const LEVEL_TO_DIFFICULTY: Record<string, Difficulty> = {
  Junior: 'easy',
  Mid: 'medium',
  Senior: 'hard',
};

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];

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

export interface UserStoreState {
  profile: UserProfile;
  stats: UserStats;
  rank: typeof initialRank;
  topicMastery: typeof topicMastery;
  packProgress: PackProgress[];
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
  settings: UserSettings;
  resetStore: () => void;
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
  setStack: (stack: string[]) => void;
  setDifficulty: (difficulty: string) => void;
  completeOnboarding: () => void;
  markSnippetCompleted: (packId: string, snippetId: string, wasCorrect: boolean) => void;
  markQuestionAsSolved: (id: string) => void;
  addXp: (amount: number) => void;
  incrementStreak: () => void;
  syncStreakIntegrity: () => void;
  logActivity: (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;
  ensureDailySet: () => void;
  submitDailyAnswer: (
    questionId: string,
    isCorrect: boolean,
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
  | 'isOnboardingCompleted'
  | 'selectedStack'
  | 'difficulty'
  | 'settings'
  | 'solvedDailyIds'
  | 'correctlySolvedDailyIds'
  | 'lastStreakDate'
  | 'dailyState'
  | 'activityLog'
> {
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
    packProgress: ensurePackProgressEntries([]),
    isOnboardingCompleted: false,
    selectedStack: [],
    difficulty: '',
    settings: {
      notificationsEnabled: true,
      hapticsEnabled: true,
      theme: 'dark',
    },
    solvedDailyIds: [],
    correctlySolvedDailyIds: [],
    lastStreakDate: null,
    dailyState: createInitialDailyState(),
    activityLog: [],
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
      completeOnboarding: () =>
        set(() => ({
          isOnboardingCompleted: true,
        })),
      markSnippetCompleted: (packId, snippetId, wasCorrect) => {
        const state = get();
        const normalizedPackProgress = ensurePackProgressEntries(state.packProgress);
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

        const updatedPackProgress = baseProgress.map((p) => {
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

        const shouldAwardPracticeXp = wasCorrect && isFirstTimeCompletion;
        const solvedDelta = shouldAwardPracticeXp ? 1 : 0;
        const practiceXpGain = shouldAwardPracticeXp ? 5 : 0;
        const nextRank =
          practiceXpGain > 0
            ? getNormalizedRankFromXp(state.rank, state.rank.xp + practiceXpGain)
            : state.rank;

        set({
          rank: nextRank,
          stats: {
            ...state.stats,
            solved: state.stats.solved + solvedDelta,
            accuracy: state.stats.accuracy,
          },
          packProgress: updatedPackProgress,
        });

        if (practiceXpGain > 0) {
          get().logActivity({
            type: 'pack',
            title: 'Practice Snippet Solved',
            xpGained: practiceXpGain,
          });
        }
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
        set((state) => ({
          activityLog: [
            {
              ...entry,
              id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
              timestamp: now,
            },
            ...state.activityLog,
          ].slice(0, 50),
        }));
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
      submitDailyAnswer: (questionId, isCorrect) => {
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

        const nextPackProgress =
          packId === null
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

        if (!completed) {
          set({
            rank,
            solvedDailyIds: solvedIds,
            correctlySolvedDailyIds: correctlySolvedIds,
            packProgress: nextPackProgress,
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
        });

        return { nextQuestionId: null, isSetCompleted: true };
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 6,
      migrate: (persistedState: unknown) => {
        const state = (persistedState ?? {}) as Partial<UserStoreState> & {
          rank?: Partial<typeof initialRank>;
        };
        const persistedXp =
          typeof state.rank?.xp === 'number' ? state.rank.xp : initialRank.xp;
        const normalizedRank = getNormalizedRankFromXp(initialRank, persistedXp);

        return {
          ...state,
          rank: {
            ...normalizedRank,
            ...(state.rank ?? {}),
            ...normalizedRank,
          },
          packProgress: ensurePackProgressEntries(state.packProgress),
          correctlySolvedDailyIds: state.correctlySolvedDailyIds ?? [],
          activityLog: state.activityLog ?? [],
          settings: {
            notificationsEnabled: true,
            hapticsEnabled: true,
            theme: 'dark',
            ...(state.settings ?? {}),
          },
        } as UserStoreState;
      },
      partialize: (state) => ({
        profile: state.profile,
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
        settings: state.settings,
      }),
    },
  ),
);

export default useUserStore;

