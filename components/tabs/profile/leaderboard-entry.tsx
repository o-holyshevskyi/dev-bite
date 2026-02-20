import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import { getLeaderboard } from '@/src/utils/leaderboard';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'expo-router';
import { Card, useThemeColor } from 'heroui-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const LeaderboardEntry = () => {
  const router = useRouter();
  const muted = useThemeColor('muted');
  const foreground = useThemeColor('foreground');
  const accent = useThemeColor('accent');
  const userXp = useUserStore((state) => state.rank.xp);

  const globalRank = useMemo(() => {
    const entry = getLeaderboard(userXp).find((item) => item.isUser);
    return entry?.rank ?? 0;
  }, [userXp]);

  return (
    <View style={styles.container}>
      <Card
        style={[
          styles.card,
          {
            borderColor: accent + '40',
            backgroundColor: accent + '20',
          },
        ]}
      >
        <Card.Body style={styles.body}>
          <Pressable
            onPress={() => router.push('/leaderboard')}
            style={({ pressed }) => [
              styles.row,
              {
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: accent + '20' }]}>
                <IconSymbol name="trophy.fill" size={18} color={accent} />
              </View>
              <View>
                <ThemedText style={[styles.title, { color: foreground }]}>Leaderboard</ThemedText>
                <ThemedText style={[styles.subtitle, { color: muted }]}>
                  View global rankings
                </ThemedText>
              </View>
            </View>
            <View style={styles.rowRight}>
              <ThemedText style={[styles.rankText, { color: accent }]}>
                {globalRank > 0 ? `#${globalRank}` : '--'}
              </ThemedText>
              <IconSymbol name="chevron.right" size={16} color={muted} />
            </View>
          </Pressable>
        </Card.Body>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  body: {
    paddingVertical: 6,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankText: {
    fontSize: 15,
    fontWeight: '800',
  },
});

export default LeaderboardEntry;
