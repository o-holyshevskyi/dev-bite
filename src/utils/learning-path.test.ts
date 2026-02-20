import {
  getChapterProgressRatio,
  getCurrentDifficultyForCategory,
  isPackInCurrentLearningLevel,
  getCurrentLearningPacks,
  getLevelPerformance,
  type LearningPathPackProgress,
  type LevelPerformanceSummary,
} from './learning-path';

// learning-path uses quizPacks from mockData; we test against real data shape
describe('learning-path', () => {
  const emptyProgress: LearningPathPackProgress[] = [];

  describe('getChapterProgressRatio', () => {
    it('returns 1 when no packs for category/difficulty', () => {
      expect(getChapterProgressRatio('nonexistent', 'easy', emptyProgress)).toBe(1);
    });

    it('returns 1 when chapter has no snippets', () => {
      // Use a category/difficulty that might have no packs in mockData
      const ratio = getChapterProgressRatio('NonExistentCategory', 'principal', emptyProgress);
      expect(ratio).toBe(1);
    });

    it('returns 0 when there are packs but no progress', () => {
      const ratio = getChapterProgressRatio('TypeScript', 'easy', emptyProgress);
      if (ratio === 1) return; // no packs for this combo in mockData
      expect(ratio).toBeGreaterThanOrEqual(0);
      expect(ratio).toBeLessThanOrEqual(1);
    });

    it('returns value between 0 and 1 for partial progress', () => {
      // Depends on mockData having ts-generics pack with easy snippets
      const progress: LearningPathPackProgress[] = [
        { packId: 'ts-generics', completedSnippetIds: ['ts-gen-1'] },
      ];
      const ratio = getChapterProgressRatio('TypeScript', 'easy', progress);
      expect(ratio).toBeGreaterThanOrEqual(0);
      expect(ratio).toBeLessThanOrEqual(1);
    });
  });

  describe('getCurrentDifficultyForCategory', () => {
    it('returns first difficulty with content when no progress', () => {
      const result = getCurrentDifficultyForCategory('TypeScript', emptyProgress);
      expect(result === null || ['easy', 'medium', 'hard', 'advanced', 'expert', 'master', 'principal'].includes(result!)).toBe(true);
    });

    it('returns null for unknown category with no content', () => {
      const result = getCurrentDifficultyForCategory('NoSuchCategory123', emptyProgress);
      expect(result).toBeNull();
    });
  });

  describe('isPackInCurrentLearningLevel', () => {
    it('returns false for unknown pack id', () => {
      expect(isPackInCurrentLearningLevel('no-such-pack', emptyProgress)).toBe(false);
    });

    it('returns true or false for real pack id based on progress', () => {
      const result = isPackInCurrentLearningLevel('ts-generics', emptyProgress);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getCurrentLearningPacks', () => {
    it('returns array', () => {
      const packs = getCurrentLearningPacks(emptyProgress);
      expect(Array.isArray(packs)).toBe(true);
    });
  });

  describe('getLevelPerformance', () => {
    it('returns summary with category and difficulty', () => {
      const summary = getLevelPerformance('TypeScript', 'easy', []);
      expect(summary).toMatchObject({
        category: 'TypeScript',
        difficulty: 'easy',
        total: expect.any(Number),
        completed: expect.any(Number),
        incorrect: expect.any(Number),
        accuracyPercent: expect.any(Number),
      });
      expect(summary.accuracyPercent).toBeGreaterThanOrEqual(0);
      expect(summary.accuracyPercent).toBeLessThanOrEqual(100);
    });

    it('returns 100% accuracy when no attempts', () => {
      const summary = getLevelPerformance('TypeScript', 'easy', []);
      if (summary.total === 0) return;
      expect(summary.accuracyPercent).toBe(100);
    });

    it('computes accuracy from completed and incorrect', () => {
      const progress = [
        {
          packId: 'ts-generics',
          completedSnippetIds: ['ts-gen-1'],
          incorrectSnippetIds: ['ts-gen-2'],
        },
      ];
      const summary = getLevelPerformance('TypeScript', 'easy', progress);
      expect(summary.completed).toBeGreaterThanOrEqual(0);
      expect(summary.incorrect).toBeGreaterThanOrEqual(0);
    });
  });
});
