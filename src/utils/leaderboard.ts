export type LeaderboardEntry = {
  id: string;
  name: string;
  xp: number;
  avatarUrl: string;
  rank: number;
  isUser?: boolean;
};

const MIN_COMPETITIVE_RANK = 5;
const MAX_COMPETITIVE_RANK = 15;

type BotSeed = Pick<LeaderboardEntry, 'id' | 'name'>;

const BOT_USERS: BotSeed[] = [
  { id: 'bot-code-runner', name: 'CodeRunner' },
  { id: 'bot-react-master', name: 'ReactMaster' },
  { id: 'bot-js-sage', name: 'JSSage' },
  { id: 'bot-ts-smith', name: 'TypeSmith' },
  { id: 'bot-bug-hunter', name: 'BugHunter' },
  { id: 'bot-hook-wizard', name: 'HookWizard' },
  { id: 'bot-api-forge', name: 'APIForge' },
  { id: 'bot-merge-monk', name: 'MergeMonk' },
  { id: 'bot-stack-captain', name: 'StackCaptain' },
  { id: 'bot-git-guardian', name: 'GitGuardian' },
  { id: 'bot-cache-ninja', name: 'CacheNinja' },
  { id: 'bot-query-knight', name: 'QueryKnight' },
  { id: 'bot-loop-lord', name: 'LoopLord' },
  { id: 'bot-pixel-pilot', name: 'PixelPilot' },
  { id: 'bot-ui-samurai', name: 'UISamurai' },
  { id: 'bot-null-buster', name: 'NullBuster' },
  { id: 'bot-byte-bandit', name: 'ByteBandit' },
  { id: 'bot-refactor-ranger', name: 'RefactorRanger' },
  { id: 'bot-cloud-crafter', name: 'CloudCrafter' },
  { id: 'bot-ci-cd-chief', name: 'PipelineChief' },
  { id: 'bot-rust-rider', name: 'RustRider' },
  { id: 'bot-go-guru', name: 'GoGuru' },
  { id: 'bot-python-pro', name: 'PythonPro' },
  { id: 'bot-dev-ops-oracle', name: 'DevOpsOracle' },
];

function getTargetUserRank(userXP: number): number {
  const span = MAX_COMPETITIVE_RANK - MIN_COMPETITIVE_RANK + 1;
  return MIN_COMPETITIVE_RANK + (Math.max(0, Math.floor(userXP)) % span);
}

function hashToUnitInterval(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

export function getRandomAvatarUrl(seed: string): string {
  const normalizedSeed = seed.trim().length > 0 ? seed.trim() : 'player';
  return `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(normalizedSeed)}&size=256`;
}

export function getLeaderboard(userXP: number): LeaderboardEntry[] {
  const safeUserXP = Math.max(0, Math.floor(userXP));
  const targetRank = getTargetUserRank(safeUserXP);
  const botsAboveUser = Math.max(0, Math.min(BOT_USERS.length, targetRank - 1));

  const botEntries: LeaderboardEntry[] = BOT_USERS.map((bot, index) => {
    const randomFactor = hashToUnitInterval(`${bot.id}:${safeUserXP}`);

    if (index < botsAboveUser) {
      const distanceToUser = botsAboveUser - index;
      const gap = 25 + distanceToUser * 35 + Math.floor(randomFactor * 20);
      return {
        ...bot,
        avatarUrl: getRandomAvatarUrl(`${bot.id}:${bot.name}`),
        xp: safeUserXP + gap,
        rank: 0,
      };
    }

    const distanceBelow = index - botsAboveUser + 1;
    const gap = 20 + distanceBelow * 30 + Math.floor(randomFactor * 18);
    return {
      ...bot,
      avatarUrl: getRandomAvatarUrl(`${bot.id}:${bot.name}`),
      xp: Math.max(0, safeUserXP - gap),
      rank: 0,
    };
  });

  const userEntry: LeaderboardEntry = {
    id: 'user',
    name: 'You',
    xp: safeUserXP,
    avatarUrl: getRandomAvatarUrl('user:You'),
    rank: 0,
    isUser: true,
  };

  return [...botEntries, userEntry]
    .sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      if (a.isUser) return -1;
      if (b.isUser) return 1;
      return a.name.localeCompare(b.name);
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}
