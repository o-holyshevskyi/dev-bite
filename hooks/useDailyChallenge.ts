import { useEffect, useMemo } from 'react';
import { getSnippetWithPackById, type Snippet, type QuizPack } from '@/src/data/mockData';
import useUserStore from '@/store/userStore';

export interface DailyChallengeResult {
  setId: string | null;
  questionIds: string[];
  results: [0 | 1 | 2, 0 | 1 | 2, 0 | 1 | 2];
  currentIndex: 0 | 1 | 2;
  isCompleted: boolean;
  progressCount: number;
  current: {
    snippet: Snippet;
    pack: QuizPack;
  } | null;
}

export function useDailyChallenge(): DailyChallengeResult | null {
  const dailyState = useUserStore((s) => s.dailyState);
  const ensureDailySet = useUserStore((s) => s.ensureDailySet);

  useEffect(() => {
    ensureDailySet();
  }, [ensureDailySet]);

  return useMemo(() => {
    const questionIds = dailyState.questionIds.filter(Boolean) as string[];
    const progressCount = dailyState.results.filter((r) => r !== 0).length;
    const currentId = dailyState.questionIds[dailyState.currentIndex];
    const current = currentId ? getSnippetWithPackById(currentId) : null;

    if (questionIds.length === 0) return null;

    return {
      setId: dailyState.currentSetId,
      questionIds,
      results: dailyState.results,
      currentIndex: dailyState.currentIndex,
      isCompleted: dailyState.isCompleted,
      progressCount,
      current,
    };
  }, [dailyState]);
}
