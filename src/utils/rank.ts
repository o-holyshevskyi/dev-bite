export interface LevelBounds {
  level: number;
  levelStartXp: number;
  levelEndXp: number;
  xpIntoLevel: number;
  xpRequiredForLevel: number;
  progressPercent: number;
}

const RANK_TITLES_BY_LEVEL = [
  'Script Kiddie',
  'Debug Rookie',
  'Patch Crafter',
  'Bug Hunter',
  'Logic Tactician',
  'System Builder',
  'Code Commander',
  'Architecture Sage',
  'Performance Virtuoso',
  'Legendary Engineer',
] as const;

export function getRankNameFromLevel(level: number): string {
  const safeLevel = Math.max(1, Math.floor(level));
  const idx = Math.min(RANK_TITLES_BY_LEVEL.length - 1, safeLevel - 1);
  return RANK_TITLES_BY_LEVEL[idx];
}

export function getMaxRankTitleLevel(): number {
  return RANK_TITLES_BY_LEVEL.length;
}

export function getNextRankNameFromLevel(level: number): string | null {
  const safeLevel = Math.max(1, Math.floor(level));
  if (safeLevel >= getMaxRankTitleLevel()) return null;
  return getRankNameFromLevel(safeLevel + 1);
}

/**
 * Total XP needed to complete a given level.
 * Curve: +100, +200, +300... per level.
 * L1 end = 100, L2 end = 300, L3 end = 600...
 */
export function getXpForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return (100 * safeLevel * (safeLevel + 1)) / 2;
}

export function getLevelFromXp(xp: number): number {
  const safeXp = Math.max(0, Math.floor(xp));
  let level = 1;

  while (safeXp > getXpForLevel(level)) {
    level += 1;
  }

  return level;
}

export function getCurrentLevelBounds(xp: number): LevelBounds {
  const safeXp = Math.max(0, Math.floor(xp));
  const level = getLevelFromXp(safeXp);
  const levelStartXp = level === 1 ? 0 : getXpForLevel(level - 1);
  const levelEndXp = getXpForLevel(level);
  const xpRequiredForLevel = Math.max(1, levelEndXp - levelStartXp);
  const xpIntoLevel = Math.max(0, safeXp - levelStartXp);
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round((xpIntoLevel / xpRequiredForLevel) * 100)),
  );

  return {
    level,
    levelStartXp,
    levelEndXp,
    xpIntoLevel,
    xpRequiredForLevel,
    progressPercent,
  };
}

