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

function getChapterProgressRatio(
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
