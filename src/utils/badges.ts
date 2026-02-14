import type { UserState } from "@/store/userStore";

export type BadgeDef = {
  id: string;
  title: string;
  description: string;
  background: string;
  border: string;
  iconName: string;
  iconColor: string;
  checkUnlock: (state: UserState) => boolean;
  getProgressLabel: (state: UserState) => string;
};
export type BadgeWithUnlock = BadgeDef & { isUnlocked: boolean };

function getStartedPacksCount(state: UserState): number {
  return state.packProgress.filter(
    (pack) =>
      pack.completedSnippetIds.length > 0 || pack.incorrectSnippetIds.length > 0,
  ).length;
}

export const BADGE_DEFINITIONS: BadgeDef[] = [
  {
    id: "first-blood",
    title: "First Blood",
    description: "Solve your first challenge.",
    background: "#0FA36B33",
    border: "#0FA36B80",
    iconName: "sparkles",
    iconColor: "#FFFFFF",
    checkUnlock: (state) => state.stats.solved >= 1,
    getProgressLabel: (state) => `${state.stats.solved}/1 solved`,
  },
  {
    id: "bug-hunter",
    title: "Bug Hunter",
    description: "Solve 10 total challenges.",
    background: "#0891B233",
    border: "#0891B280",
    iconName: "ladybug.fill",
    iconColor: "#FFFFFF",
    checkUnlock: (state) => state.stats.solved >= 10,
    getProgressLabel: (state) => `${state.stats.solved}/10 solved`,
  },
  {
    id: "code-ninja",
    title: "Code Ninja",
    description: "Solve 50 total challenges.",
    background: "#7C3AED33",
    border: "#7C3AED80",
    iconName: "bolt.fill",
    iconColor: "#FFFFFF",
    checkUnlock: (state) => state.stats.solved >= 50,
    getProgressLabel: (state) => `${state.stats.solved}/50 solved`,
  },
  {
    id: "scholar",
    title: "Scholar",
    description: "Solve 100 total challenges.",
    background: "#2563EB33",
    border: "#2563EB80",
    iconName: "book.fill",
    iconColor: "#FFFFFF",
    checkUnlock: (state) => state.stats.solved >= 100,
    getProgressLabel: (state) => `${state.stats.solved}/100 solved`,
  },
  {
    id: "streak-starter",
    title: "Streak Starter",
    description: "Maintain a 3-day streak.",
    background: "#F9731633",
    border: "#F9731680",
    iconName: "flame.fill",
    iconColor: "#FFFFFF",
    checkUnlock: (state) => state.stats.streakDays >= 3,
    getProgressLabel: (state) => `${state.stats.streakDays}/3 days`,
  },
  {
    id: "firebird",
    title: "Firebird",
    description: "Maintain a 7-day streak.",
    background: "#EF444433",
    border: "#EF444480",
    iconName: "flame.fill",
    iconColor: "#FFFFFF",
    checkUnlock: (state) => state.stats.streakDays >= 7,
    getProgressLabel: (state) => `${state.stats.streakDays}/7 days`,
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    description: "Maintain a 30-day streak.",
    background: "#DC262633",
    border: "#DC262680",
    iconName: "bolt.shield.fill",
    iconColor: "#FFFFFF",
    checkUnlock: (state) => state.stats.streakDays >= 30,
    getProgressLabel: (state) => `${state.stats.streakDays}/30 days`,
  },
  {
    id: "iron-will",
    title: "Iron Will",
    description: "Maintain a 50-day streak.",
    background: "#B91C1C33",
    border: "#B91C1C80",
    iconName: "flame.circle.fill",
    iconColor: "#FFFFFF",
    checkUnlock: (state) => state.stats.streakDays >= 50,
    getProgressLabel: (state) => `${state.stats.streakDays}/50 days`,
  },
  {
    id: "century-flame",
    title: "Century Flame",
    description: "Maintain a 100-day streak.",
    background: "#7F1D1D33",
    border: "#7F1D1D80",
    iconName: "flame.circle.fill",
    iconColor: "#FFFFFF",
    checkUnlock: (state) => state.stats.streakDays >= 100,
    getProgressLabel: (state) => `${state.stats.streakDays}/100 days`,
  },
  {
    id: "eternal-spark",
    title: "Eternal Spark",
    description: "Maintain a 250-day streak.",
    background: "#581C8733",
    border: "#581C8780",
    iconName: "infinity.circle.fill",
    iconColor: "#FFFFFF",
    checkUnlock: (state) => state.stats.streakDays >= 250,
    getProgressLabel: (state) => `${state.stats.streakDays}/250 days`,
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Start your first pack.",
    background: "#FBBF2433",
    border: "#FBBF2480",
    iconName: "folder.fill",
    iconColor: "#FFFFFF",
    checkUnlock: (state) => getStartedPacksCount(state) >= 1,
    getProgressLabel: (state) => `${getStartedPacksCount(state)}/1 packs`,
  },
  {
    id: "polyglot",
    title: "Polyglot",
    description: "Start 3 or more packs.",
    background: "#0EA5E933",
    border: "#0EA5E980",
    iconName: "square.stack.3d.up.fill",
    iconColor: "#FFFFFF",
    checkUnlock: (state) => getStartedPacksCount(state) >= 3,
    getProgressLabel: (state) => `${getStartedPacksCount(state)}/3 packs`,
  },
  {
    id: "challenger",
    title: "Challenger",
    description: "Reach 500 XP.",
    background: "#22C55E33",
    border: "#22C55E80",
    iconName: "trophy.fill",
    iconColor: "#FFFFFF",
    checkUnlock: (state) => state.rank.xp >= 500,
    getProgressLabel: (state) => `${state.rank.xp}/500 XP`,
  },
  {
    id: "contender",
    title: "Contender",
    description: "Reach 1500 XP.",
    background: "#16A34A33",
    border: "#16A34A80",
    iconName: "medal.fill",
    iconColor: "#FFFFFF",
    checkUnlock: (state) => state.rank.xp >= 1500,
    getProgressLabel: (state) => `${state.rank.xp}/1500 XP`,
  },
  {
    id: "grandmaster",
    title: "Grandmaster",
    description: "Reach 2500 XP.",
    background: "#A855F733",
    border: "#A855F780",
    iconName: "crown.fill",
    iconColor: "#FFFFFF",
    checkUnlock: (state) => state.rank.xp >= 2500,
    getProgressLabel: (state) => `${state.rank.xp}/2500 XP`,
  },
  {
    id: "legend",
    title: "Legend",
    description: "Reach 5000 XP.",
    background: "#9333EA33",
    border: "#9333EA80",
    iconName: "star.circle.fill",
    iconColor: "#FFFFFF",
    checkUnlock: (state) => state.rank.xp >= 5000,
    getProgressLabel: (state) => `${state.rank.xp}/5000 XP`,
  },
];

export function getBadgesWithUnlockState(state: UserState): BadgeWithUnlock[] {
  return BADGE_DEFINITIONS.map((badge) => ({
    ...badge,
    isUnlocked: badge.checkUnlock(state),
  }));
}

export function getUnlockedBadges(state: UserState): BadgeWithUnlock[] {
  return getBadgesWithUnlockState(state).filter((badge) => badge.isUnlocked);
}

export function getLockedBadges(state: UserState): BadgeWithUnlock[] {
  return getBadgesWithUnlockState(state).filter((badge) => !badge.isUnlocked);
}
