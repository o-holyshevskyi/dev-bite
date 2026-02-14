import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import { getSnippetWithPackById } from '@/src/data/mockData';
import useUserStore from '@/store/userStore';
import { router } from 'expo-router';
import { Button, Card, useThemeColor } from 'heroui-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const XP_BY_INDEX = [10, 20, 30] as const;
const PERFECT_SET_BONUS = 50;

export default function DailyResultsScreen() {
  const insets = useSafeAreaInsets();
  const accent = useThemeColor('accent');
  const danger = useThemeColor('danger');
  const foreground = useThemeColor('foreground');
  const muted = useThemeColor('muted');
  const background = useThemeColor('background');

  const dailyState = useUserStore((s) => s.dailyState);
  const questionRows = dailyState.questionIds
    .map((id, index) => {
      if (!id) return null;
      const resolved = getSnippetWithPackById(id);
      if (!resolved) return null;
      return {
        index,
        snippetId: id,
        result: dailyState.results[index],
        ...resolved,
      };
    })
    .filter(Boolean) as Array<{
    index: number;
    snippetId: string;
    result: 0 | 1 | 2;
    snippet: ReturnType<typeof getSnippetWithPackById> extends { snippet: infer T }
      ? T
      : never;
    pack: ReturnType<typeof getSnippetWithPackById> extends { pack: infer P }
      ? P
      : never;
  }>;

  const gainedXp = dailyState.results.reduce((sum, result, index) => {
    if (result === 1) return sum + XP_BY_INDEX[index];
    return sum;
  }, 0);
  const isPerfect = dailyState.results.every((r) => r === 1);
  const totalXp = gainedXp + (isPerfect ? PERFECT_SET_BONUS : 0);

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top / 2.5 }]}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <IconSymbol name="xmark" size={24} color={foreground} />
        </Pressable>
        <ThemedText style={[styles.topBarTitle, { color: foreground }]}>
          Daily Results
        </ThemedText>
        <View style={styles.closeButton} />
      </View>

      <View style={styles.content}>
        <Card style={styles.summaryCard}>
          <Card.Header>
            <ThemedText style={{ fontSize: 22, fontWeight: '700', color: foreground }}>
              {dailyState.isCompleted ? 'Daily Set Completed' : 'Daily Set In Progress'}
            </ThemedText>
            <ThemedText style={{ marginTop: 6, color: muted }}>
              XP earned today: {totalXp}
            </ThemedText>
          </Card.Header>
          <Card.Body>
            <View style={styles.progressDots}>
              {dailyState.results.map((result, index) => {
                const bg =
                  result === 1 ? accent : result === 2 ? danger : 'transparent';
                const borderColor = result === 0 ? muted + '99' : bg;
                return (
                  <View
                    key={index}
                    style={[styles.dot, { backgroundColor: bg, borderColor }]}
                  />
                );
              })}
            </View>
          </Card.Body>
        </Card>

        {questionRows.map((row) => {
          const titleColor =
            row.result === 1 ? accent : row.result === 2 ? danger : muted;
          const stateLabel =
            row.result === 1 ? 'Correct' : row.result === 2 ? 'Wrong' : 'Pending';
          return (
            <Card key={row.snippetId} style={styles.itemCard}>
              <Card.Header>
                <ThemedText style={{ color: muted, fontSize: 12 }}>
                  Bite {row.index + 1} - {row.pack.title}
                </ThemedText>
                <ThemedText style={{ color: foreground, fontWeight: '600' }}>
                  {row.snippet.question}
                </ThemedText>
              </Card.Header>
              <Card.Footer>
                <ThemedText style={{ color: titleColor, fontWeight: '700' }}>
                  {stateLabel}
                </ThemedText>
              </Card.Footer>
            </Card>
          );
        })}

        <Button onPress={() => router.replace('/(tabs)')}>
          <Button.Label>Back to Home</Button.Label>
        </Button>
      </View>
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
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  summaryCard: {
    marginBottom: 8,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  itemCard: {
    marginBottom: 8,
  },
});
