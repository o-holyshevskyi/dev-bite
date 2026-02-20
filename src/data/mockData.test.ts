import {
  getPackById,
  getSnippetWithPackById,
  getAllSnippets,
  getChapterSnippetSession,
  quizPacks,
  initialRank,
  topicMastery,
} from './mockData';

describe('mockData', () => {
  describe('getPackById', () => {
    it('returns pack when id exists', () => {
      const first = quizPacks[0];
      expect(first).toBeDefined();
      const found = getPackById(first!.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(first!.id);
    });

    it('returns null for unknown id', () => {
      expect(getPackById('no-such-id')).toBeNull();
    });
  });

  describe('getSnippetWithPackById', () => {
    it('returns snippet and pack when snippet exists', () => {
      const firstPack = quizPacks[0];
      const firstSnippet = firstPack?.snippets[0];
      if (!firstSnippet) return;
      const found = getSnippetWithPackById(firstSnippet.id);
      expect(found).not.toBeNull();
      expect(found!.snippet.id).toBe(firstSnippet.id);
      expect(found!.pack.id).toBe(firstPack!.id);
    });

    it('returns null for unknown snippet id', () => {
      expect(getSnippetWithPackById('no-such-snippet')).toBeNull();
    });
  });

  describe('getAllSnippets', () => {
    it('returns array of snippet+pack', () => {
      const all = getAllSnippets();
      expect(Array.isArray(all)).toBe(true);
      all.forEach((item) => {
        expect(item).toHaveProperty('snippet');
        expect(item).toHaveProperty('pack');
        expect(item.snippet).toHaveProperty('id');
        expect(item.pack).toHaveProperty('id');
      });
    });
  });

  describe('getChapterSnippetSession', () => {
    it('returns empty array for empty stack', () => {
      expect(getChapterSnippetSession('', 'easy')).toEqual([]);
    });

    it('returns array when stack and level match', () => {
      const session = getChapterSnippetSession('TypeScript', 'easy', 5);
      expect(Array.isArray(session)).toBe(true);
      session.forEach((item) => {
        expect(item).toHaveProperty('snippet');
        expect(item).toHaveProperty('pack');
      });
    });

    it('respects limit', () => {
      const session = getChapterSnippetSession('TypeScript', 'easy', 2);
      expect(session.length).toBeLessThanOrEqual(2);
    });
  });

  describe('initialRank', () => {
    it('has required fields', () => {
      expect(initialRank).toMatchObject({
        level: 1,
        name: expect.any(String),
        progress: 0,
        xp: 0,
      });
    });
  });

  describe('topicMastery', () => {
    it('is non-empty array', () => {
      expect(Array.isArray(topicMastery)).toBe(true);
      expect(topicMastery.length).toBeGreaterThan(0);
      topicMastery.forEach((item) => {
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('mastered');
      });
    });
  });
});
