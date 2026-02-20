import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import { getChapterSnippetSession, quizPacks } from '@/src/data/mockData';
import useUserStore from '@/store/userStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, useThemeColor } from 'heroui-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function clampProgress(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export default function PackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const foreground = useThemeColor('foreground');
  const muted = useThemeColor('muted');
  const accent = useThemeColor('accent');
  const success = useThemeColor('success');
  const danger = useThemeColor('danger');

  const packId = typeof id === 'string' ? id : '';
  const pack = quizPacks.find((item) => item.id === packId);
  const progressForPack = useUserStore((state) =>
    state.packProgress.find((p) => p.packId === packId),
  );

  if (!pack) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <View style={styles.notFoundContent}>
          <ThemedText style={[styles.notFoundTitle, { color: foreground }]}>
            Pack not found
          </ThemedText>
          <ThemedText style={[styles.notFoundSubtitle, { color: muted }]}>
            This pack may have been removed or the link is invalid.
          </ThemedText>
          <Button onPress={() => router.back()}>
            <Button.Label>Go Back</Button.Label>
          </Button>
        </View>
      </View>
    );
  }

  const stack = pack.category ?? pack.language;
  const chapterSession = getChapterSnippetSession(stack, pack.difficulty, 25);
  const sessionSnippets = chapterSession.map((entry) => entry.snippet);
  const totalSnippets = sessionSnippets.length || 1;
  const completedSnippetIds = progressForPack?.completedSnippetIds ?? [];
  const incorrectSnippetIds = progressForPack?.incorrectSnippetIds ?? [];
  const completedCount = completedSnippetIds.length;
  const completion = clampProgress(completedCount / totalSnippets);
  const completionPercent = Math.round(completion * 100);

  const ctaLabel =
    completion >= 1 ? 'Practice Again' : completion > 0 ? 'Resume Pack' : 'Start Pack';
  const nextSnippet = sessionSnippets.find(
    (snippet) => !completedSnippetIds.includes(snippet.id),
  );
  const targetSnippetId = nextSnippet?.id ?? sessionSnippets[0]?.id;

  const handleStartPackPress = () => {
    if (!targetSnippetId) return;
    router.push({
      pathname: '/quiz/[id]',
      params: { id: targetSnippetId, packId: pack.id },
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top / 2.5 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={foreground} />
          <ThemedText style={[styles.backLabel, { color: foreground }]}>Back</ThemedText>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + insets.bottom },
        ]}
      >
        <Card style={[styles.heroCard, { borderColor: pack.color + '40' }]}>
          <Card.Header>
            <View style={styles.heroHeaderRow}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: pack.color + '30', borderColor: pack.color + '55' },
                ]}
              >
                <IconSymbol name={pack.icon as any} size={30} color={pack.color} />
              </View>
              <View style={[styles.levelBadge, { borderColor: pack.color + '70', backgroundColor: pack.color + '20' }]}>
                <ThemedText style={[styles.levelBadgeText, { color: pack.color }]}>
                  {pack.difficulty.toUpperCase()}
                </ThemedText>
              </View>
            </View>
          </Card.Header>
          <Card.Body style={styles.heroBody}>
            <ThemedText style={[styles.packTitle, { color: foreground }]}>
              {pack.title}
            </ThemedText>
            <ThemedText style={[styles.packDescription, { color: muted }]}>
              {pack.description}
            </ThemedText>
          </Card.Body>
          <Card.Footer style={styles.heroFooter}>
            <View style={styles.progressMetaRow}>
              <ThemedText style={[styles.progressLabel, { color: muted }]}>
                Progress
              </ThemedText>
              <ThemedText style={[styles.progressValue, { color: pack.color }]}>
                {completionPercent}% completed
              </ThemedText>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: pack.color + '30' }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${completionPercent}%`, backgroundColor: pack.color },
                ]}
              />
            </View>
          </Card.Footer>
        </Card>

        <View style={styles.curriculumSection}>
          <ThemedText style={[styles.sectionTitle, { color: foreground }]}>
            Curriculum
          </ThemedText>
          <View style={styles.snippetList}>
            {sessionSnippets.map((snippet, index) => {
              const isCompleted = completedSnippetIds.includes(snippet.id);
              const isIncorrect = !isCompleted && incorrectSnippetIds.includes(snippet.id);
              const statusIcon = isCompleted
                ? 'checkmark.circle.fill'
                : isIncorrect
                  ? 'xmark.circle.fill'
                  : 'play.fill';
              const statusColor = isCompleted ? success : isIncorrect ? danger : accent;
              const rowOpacity = isCompleted ? 0.7 : isIncorrect ? 0.9 : 1;
              const handleSnippetPress = () => {
                router.push({
                  pathname: '/quiz/[id]',
                  params: { id: snippet.id, packId: pack.id },
                });
              };

              return (
                <Pressable
                  key={snippet.id}
                  onPress={handleSnippetPress}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Card
                    style={[
                      styles.snippetRow,
                      {
                        borderColor: isCompleted
                          ? success + '30'
                          : isIncorrect
                            ? danger + '30'
                            : 'rgba(255,255,255,0.07)',
                        opacity: rowOpacity,
                      },
                    ]}
                  >
                    <Card.Body style={styles.snippetRowBody}>
                      <View style={styles.snippetLeft}>
                        <View
                          style={[
                            styles.statusCircle,
                            {
                              backgroundColor: isCompleted
                                ? success + '20'
                                : isIncorrect
                                  ? danger + '20'
                                  : accent + '20',
                              borderColor: statusColor + '40',
                            },
                          ]}
                        >
                          <IconSymbol name={statusIcon as any} size={16} color={statusColor} />
                        </View>
                        <View>
                          <ThemedText style={[styles.snippetTitle, { color: foreground }]}>
                            {snippet.question}
                          </ThemedText>
                          <ThemedText style={[styles.snippetMeta, { color: muted }]}>
                            Snippet {index + 1}
                          </ThemedText>
                        </View>
                      </View>
                    </Card.Body>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          size="lg"
          style={styles.footerButton}
          isDisabled={!targetSnippetId}
          onPress={handleStartPackPress}
        >
          <Button.Label style={styles.footerButtonLabel}>{ctaLabel}</Button.Label>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 8,
  },
  backLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 20,
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
  },
  heroHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 62,
    height: 62,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBody: {
    marginTop: 4,
    gap: 8,
  },
  packTitle: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  packDescription: {
    fontSize: 15,
    lineHeight: 21,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  heroFooter: {
    marginTop: 10,
    gap: 10,
  },
  progressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  curriculumSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  snippetList: {
    gap: 10,
  },
  snippetRow: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1,
  },
  snippetRowBody: {
    paddingVertical: 12,
  },
  snippetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusCircle: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snippetTitle: {
    fontSize: 15,
    lineHeight: 20,
    maxWidth: '92%',
  },
  snippetMeta: {
    marginTop: 2,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: 'rgba(0,0,0,0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  footerButton: {
    width: '100%',
  },
  footerButtonLabel: {
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  notFoundContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  notFoundTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  notFoundSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
});
