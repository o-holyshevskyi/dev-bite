import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import { getLeaderboard, getRandomAvatarUrl, type LeaderboardEntry } from '@/src/utils/leaderboard';
import useUserStore from '@/store/userStore';
import { useRouter } from 'expo-router';
import { Avatar, Card, useThemeColor } from 'heroui-native';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AccentTone = {
  border: string;
  background: string;
  rankText: string;
};

function getTopAccent(rank: number): AccentTone | null {
  if (rank === 1) {
    return {
      border: '#F5C542',
      background: 'rgba(245, 197, 66, 0.14)',
      rankText: '#F5C542',
    };
  }

  if (rank === 2) {
    return {
      border: '#B8C2CC',
      background: 'rgba(184, 194, 204, 0.14)',
      rankText: '#B8C2CC',
    };
  }

  if (rank === 3) {
    return {
      border: '#CD7F32',
      background: 'rgba(205, 127, 50, 0.14)',
      rankText: '#CD7F32',
    };
  }

  return null;
}

function getAvatarSize(rank: number): number {
  if (rank === 1) return 52;
  if (rank === 2) return 48;
  if (rank === 3) return 44;
  return 40;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function LeaderboardRow({
  item,
  foreground,
  muted,
  accent,
  cardBackground,
}: {
  item: LeaderboardEntry;
  foreground: string;
  muted: string;
  accent: string;
  cardBackground: string;
}) {
  const topAccent = getTopAccent(item.rank);
  const avatarSize = getAvatarSize(item.rank);
  const isUser = !!item.isUser;
  const rowBorderColor = isUser ? accent + '88' : accent + '40';
  const rowBackgroundColor = isUser ? `${accent}12` : cardBackground;

  return (
    <Card
      style={[
        styles.rowCard,
        {
          borderColor: rowBorderColor,
          backgroundColor: rowBackgroundColor,
        },
      ]}
    >
      <Card.Body style={styles.rowBody}>
        <View style={styles.rankWrap}>
          <ThemedText
            style={[
              styles.rankText,
              {
                color: topAccent?.rankText ?? (isUser ? accent : muted),
              },
            ]}
          >
            #{item.rank}
          </ThemedText>
        </View>

        <View
          style={[
            styles.avatarWrap,
            {
              width: avatarSize,
              height: avatarSize,
              borderColor: topAccent?.border ?? rowBorderColor,
              backgroundColor: `${muted}1F`,
            },
          ]}
        >
          <Avatar
            alt={item.name}
            style={{
              width: avatarSize - 4,
              height: avatarSize - 4,
            }}
          >
            <Avatar.Image source={{ uri: item.avatarUrl }} />
            <Avatar.Fallback style={styles.avatarFallback}>
              <ThemedText
                style={[
                  styles.avatarFallbackText,
                  {
                    color: isUser ? accent : muted,
                    fontSize: Math.max(11, Math.floor((avatarSize - 4) * 0.34)),
                  },
                ]}
              >
                {getInitials(item.name)}
              </ThemedText>
            </Avatar.Fallback>
          </Avatar>
        </View>

        <View style={styles.userInfo}>
          <ThemedText style={[styles.nameText, { color: foreground }]}>
            {item.name}
            {isUser ? ' (You)' : ''}
          </ThemedText>
          <ThemedText style={[styles.metaText, { color: muted }]}>
            Rank {item.rank}
          </ThemedText>
        </View>

        <ThemedText style={[styles.xpText, { color: isUser ? accent : foreground }]}>
          {item.xp} XP
        </ThemedText>
      </Card.Body>
    </Card>
  );
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const foreground = useThemeColor('foreground');
  const muted = useThemeColor('muted');
  const accent = useThemeColor('accent');
  const xp = useUserStore((state) => state.rank.xp);
  const profile = useUserStore((state) => state.profile);
  const cardBackground = accent + '20';
  const cardBorder = accent + '40';

  const leaderboard = useMemo(() => {
    const raw = getLeaderboard(xp);
    return raw.map((entry) => {
      if (!entry.isUser) return entry;
      return {
        ...entry,
        name: profile.name?.trim() ? profile.name : entry.name,
        avatarUrl: profile.avatarUrl?.trim()
          ? profile.avatarUrl
          : (entry.avatarUrl?.trim() ? entry.avatarUrl : getRandomAvatarUrl(entry.id)),
      };
    });
  }, [xp, profile.name, profile.avatarUrl]);

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={foreground} />
          <ThemedText style={[styles.backText, { color: foreground }]}>Back</ThemedText>
        </Pressable>
        <ThemedText style={[styles.topBarTitle, { color: foreground }]}>Leaderboard</ThemedText>
        <View style={styles.rightSpacer} />
      </View>

      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={
          <Card
            style={[
              styles.headerCard,
              {
                backgroundColor: cardBackground,
                borderColor: cardBorder,
              },
            ]}
          >
            <Card.Body>
              <ThemedText style={[styles.headerTitle, { color: foreground }]}>Global Dev Rankings</ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: muted }]}>
                Climb by earning more XP through daily and practice challenges.
              </ThemedText>
            </Card.Body>
          </Card>
        }
        renderItem={({ item }) => (
          <LeaderboardRow
            item={item}
            foreground={foreground}
            muted={muted}
            accent={accent}
            cardBackground={cardBackground}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 84,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  rightSpacer: {
    width: 84,
    height: 40,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  headerCard: {
    borderWidth: 1,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  rowCard: {
    borderWidth: 1,
    borderRadius: 14,
  },
  rowBody: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankWrap: {
    width: 54,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '800',
  },
  avatarWrap: {
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
  },
  metaText: {
    marginTop: 1,
    fontSize: 12,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
