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
  setName: (name: string) => void;
  setTitle: (title: string) => void;
  setAvatarUrl: (avatarUrl: string | null) => void;
  setStack: (stack: string[]) => void;
  setDifficulty: (difficulty: string) => void;
  completeOnboarding: () => void;
  markSnippetCompleted: (packId: string, snippetId: string, wasCorrect: boolean) => void;
  markQuestionAsSolved: (id: string) => void;
  addXp: (amount: number) => void;
  incrementStreak: () => void;
  ensureDailySet: () => void;
  submitDailyAnswer: (
    questionId: string,
    isCorrect: boolean,
  ) => { nextQuestionId: string | null; isSetCompleted: boolean };
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      profile: {
        name: 'Alex Chen',
        title: 'Senior Architect',
        avatarUrl: '',
      },
      stats: {
        streakDays: 0,
        solved: 0,
        accuracy: 0.00,
        globalRankTopPercent: 0.005,
      },
      rank: initialRank,
      topicMastery,
      packProgress: ensurePackProgressEntries([]),
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

        const existing = normalizedPackProgress.find((p) => p.packId === packId);
        const alreadyCompleted = existing?.completedSnippetIds.includes(snippetId);

        const updatedPackProgress = normalizedPackProgress.map((p) =>
          p.packId !== packId || alreadyCompleted
            ? p
            : {
                ...p,
                completedSnippetIds: [...p.completedSnippetIds, snippetId],
              },
        );

        const solvedDelta = alreadyCompleted ? 0 : 1;

        set({
          stats: {
            ...state.stats,
            solved: state.stats.solved + solvedDelta,
            accuracy: state.stats.accuracy,
          },
          packProgress: updatedPackProgress,
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
      ensureDailySet: () => {
        const state = get();
        const today = getLocalDateKey();
        const yesterday = getYesterdayLocalDateKey();

        // Streak freeze is not implemented yet, so we reset if user skipped days.
        if (
          state.dailyState.lastCompletedDate &&
          state.dailyState.lastCompletedDate !== today &&
          state.dailyState.lastCompletedDate < yesterday &&
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
                if (pack.completedSnippetIds.includes(questionId)) return pack;
                return {
                  ...pack,
                  completedSnippetIds: [...pack.completedSnippetIds, questionId],
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

        let streakDays = state.stats.streakDays;
        if (state.dailyState.lastCompletedDate === today) {
          // no-op (already completed today)
        } else if (state.dailyState.lastCompletedDate === yesterday) {
          streakDays += 1;
        } else {
          streakDays = 1;
        }

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

        return { nextQuestionId: null, isSetCompleted: true };
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 5,
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
      }),
    },
  ),
);

export default useUserStore;

