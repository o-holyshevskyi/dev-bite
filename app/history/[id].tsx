import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import { getSnippetWithPackById } from '@/src/data/mockData';
import useUserStore from '@/store/userStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { Pressable, StyleSheet, View } from 'react-native';
import CodeHighlighter from 'react-native-code-highlighter';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { anOldHope as style } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const CODE_BG = '#1e1e1e';
const LINE_BG = '#25262a';

function getCodeLanguage(packId: string): string {
  if (packId.includes('ts-') || packId.includes('dotnet')) return 'typescript';
  if (packId.includes('rust')) return 'rust';
  if (packId.includes('go-')) return 'go';
  if (packId.includes('python')) return 'python';
  if (packId.includes('react')) return 'javascript';
  return 'javascript';
}

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const foreground = useThemeColor('foreground');
  const muted = useThemeColor('muted');
  const accent = useThemeColor('accent');
  const danger = useThemeColor('danger');
  const success = useThemeColor('success');
  const background = useThemeColor('background');

  const activityLog = useUserStore((state) => state.activityLog);
  const targetId = typeof id === 'string' ? id : '';
  const activity =
    activityLog.find((entry) => entry.id === targetId) ??
    activityLog.find((entry) => entry.snippetId === targetId);
  const resolved = activity?.snippetId
    ? getSnippetWithPackById(activity.snippetId)
    : getSnippetWithPackById(targetId);
  const snippet = resolved?.snippet;
  const pack = resolved?.pack;

  if (!activity || !snippet || !pack) {
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={20} color={foreground} />
            <ThemedText style={[styles.backText, { color: foreground }]}>
              Back
            </ThemedText>
          </Pressable>
          <ThemedText style={[styles.topBarTitle, { color: foreground }]}>
            History Detail
          </ThemedText>
          <View style={styles.rightSpacer} />
        </View>
        <View style={styles.emptyState}>
          <ThemedText style={[styles.emptyTitle, { color: foreground }]}>
            History item not found
          </ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: muted }]}>
            This entry may be from older data without snippet details.
          </ThemedText>
        </View>
      </View>
    );
  }

  const yourAnswerId = activity.userAnswerId ?? null;
  const yourAnswer = yourAnswerId
    ? snippet.answers.find((answer) => answer.id === yourAnswerId)?.text
    : null;
  const correctAnswer =
    snippet.answers.find((answer) => answer.id === snippet.correctAnswerId)?.text ?? '';
  const isCorrect = yourAnswerId === snippet.correctAnswerId;
  const codeLang = getCodeLanguage(pack.id);

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={foreground} />
          <ThemedText style={[styles.backText, { color: foreground }]}>
            Back
          </ThemedText>
        </Pressable>
        <ThemedText style={[styles.topBarTitle, { color: foreground }]}>
          History Detail
        </ThemedText>
        <View style={styles.rightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <ThemedText style={[styles.packLabel, { color: accent }]}>
            {pack.title}
          </ThemedText>
          <ThemedText style={[styles.questionText, { color: foreground }]}>
            {snippet.question}
          </ThemedText>
        </View>

        <View style={styles.codeContainer}>
          <View style={[styles.codeHeader, { backgroundColor: LINE_BG }]}>
            <View style={styles.codeDots}>
              <View style={[styles.dot, { backgroundColor: '#ff5f56' }]} />
              <View style={[styles.dot, { backgroundColor: '#ffbd2e' }]} />
              <View style={[styles.dot, { backgroundColor: '#27c93f' }]} />
            </View>
            <ThemedText style={[styles.codeFilename, { color: muted }]}>
              snippet.{codeLang === 'typescript' ? 'ts' : codeLang === 'python' ? 'py' : 'js'}
            </ThemedText>
          </View>
          <CodeHighlighter
            language={codeLang}
            hljsStyle={style}
            scrollViewProps={{
              scrollEnabled: false,
              contentContainerStyle: styles.codeContent,
              style: { backgroundColor: CODE_BG },
            }}
            textStyle={styles.codeText}
            wrapLongLines
          >
            {snippet.code}
          </CodeHighlighter>
        </View>

        <View style={[styles.resultCard, { borderColor: accent + '35', backgroundColor: accent + '10' }]}>
          <View style={styles.resultRow}>
            <ThemedText style={[styles.resultLabel, { color: muted }]}>Your Answer</ThemedText>
            <ThemedText style={[styles.resultValue, { color: isCorrect ? success : danger }]}>
              {yourAnswer ?? 'No answer captured'}
            </ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: accent + '35' }]} />
          <View style={styles.resultRow}>
            <ThemedText style={[styles.resultLabel, { color: muted }]}>Correct Answer</ThemedText>
            <ThemedText style={[styles.resultValue, { color: success }]}>{correctAnswer}</ThemedText>
          </View>
        </View>

        <View style={[styles.explanationCard, { borderColor: accent + '40', backgroundColor: accent + '12' }]}>
          <View style={styles.explanationHeader}>
            <View style={[styles.infoIconWrap, { backgroundColor: accent + '24' }]}>
              <IconSymbol name="info.circle.fill" size={18} color={accent} />
            </View>
            <ThemedText style={[styles.explanationTitle, { color: foreground }]}>
              Explanation
            </ThemedText>
          </View>
          <ThemedText style={[styles.explanationBody, { color: muted }]}>
            {snippet.explanation}
          </ThemedText>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 14,
  },
  headerBlock: {
    gap: 6,
  },
  packLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '600',
  },
  codeContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  codeDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  codeFilename: {
    fontSize: 12,
  },
  codeContent: {
    padding: 12,
    minWidth: '100%',
  },
  codeText: {
    fontSize: 14,
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  resultRow: {
    gap: 6,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  resultValue: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  divider: {
    height: 1,
  },
  explanationCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  explanationBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});
