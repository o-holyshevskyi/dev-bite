import { quizPacks, type Difficulty } from '@/src/data/mockData';

export type LearningPathPackProgress = {
  packId: string;
  completedSnippetIds: string[];
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

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase();
}

function getChapterPacks(category: string, difficulty: Difficulty) {
  const normalizedCategory = normalizeCategory(category);
  return quizPacks.filter(
    (pack) =>
      normalizeCategory(pack.category ?? pack.language) === normalizedCategory &&
      pack.difficulty === difficulty,
  );
}

export function getChapterProgressRatio(
  category: string,
  difficulty: Difficulty,
  packProgress: LearningPathPackProgress[],
): number {
  const chapterPacks = getChapterPacks(category, difficulty);
  if (chapterPacks.length === 0) return 1;

  const snippetIds = new Set(
    chapterPacks.flatMap((pack) => pack.snippets.map((snippet) => snippet.id)),
  );
  if (snippetIds.size === 0) return 1;

  const completedSnippetIds = new Set<string>();
  for (const pack of chapterPacks) {
    const progress = packProgress.find((entry) => entry.packId === pack.id);
    if (!progress) continue;
    for (const snippetId of progress.completedSnippetIds) {
      if (snippetIds.has(snippetId)) completedSnippetIds.add(snippetId);
    }
  }

  return completedSnippetIds.size / snippetIds.size;
}

export function getCurrentDifficultyForCategory(
  category: string,
  packProgress: LearningPathPackProgress[],
): Difficulty | null {
  let lastAvailable: Difficulty | null = null;

  for (const difficulty of DIFFICULTY_ORDER) {
    const hasContent = getChapterPacks(category, difficulty).length > 0;
    if (!hasContent) continue;
    lastAvailable = difficulty;

    const ratio = getChapterProgressRatio(category, difficulty, packProgress);
    if (ratio < 1) return difficulty;
  }

  return lastAvailable;
}

export function isPackInCurrentLearningLevel(
  packId: string,
  packProgress: LearningPathPackProgress[],
): boolean {
  const pack = quizPacks.find((entry) => entry.id === packId);
  if (!pack) return false;

  const category = pack.category ?? pack.language;
  const currentDifficulty = getCurrentDifficultyForCategory(category, packProgress);
  if (!currentDifficulty) return true;
  return pack.difficulty === currentDifficulty;
}

export function getCurrentLearningPacks(
  packProgress: LearningPathPackProgress[],
) {
  return quizPacks.filter((pack) =>
    isPackInCurrentLearningLevel(pack.id, packProgress),
  );
}

export type LevelPerformanceSummary = {
  category: string;
  difficulty: Difficulty;
  total: number;
  completed: number;
  incorrect: number;
  accuracyPercent: number;
};

/** Aggregates completion and accuracy for a chapter (category + difficulty). */
export function getLevelPerformance(
  category: string,
  difficulty: Difficulty,
  packProgress: Array<{ packId: string; completedSnippetIds: string[]; incorrectSnippetIds: string[] }>,
): LevelPerformanceSummary {
  const chapterPacks = getChapterPacks(category, difficulty);
  const snippetIds = new Set(
    chapterPacks.flatMap((pack) => pack.snippets.map((s) => s.id)),
  );
  const total = snippetIds.size;
  const completed = new Set<string>();
  const incorrect = new Set<string>();
  for (const pack of chapterPacks) {
    const entry = packProgress.find((e) => e.packId === pack.id);
    if (!entry) continue;
    for (const id of entry.completedSnippetIds ?? []) {
      if (snippetIds.has(id)) completed.add(id);
    }
    for (const id of entry.incorrectSnippetIds ?? []) {
      if (snippetIds.has(id)) incorrect.add(id);
    }
  }
  const attempted = completed.size + incorrect.size;
  const accuracyPercent =
    attempted > 0
      ? Math.round((completed.size / Math.max(1, completed.size + incorrect.size)) * 100)
      : 100;
  return {
    category,
    difficulty,
    total,
    completed: completed.size,
    incorrect: incorrect.size,
    accuracyPercent,
  };
}
