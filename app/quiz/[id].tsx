import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import { getSnippetWithPackById } from '@/src/data/mockData';
import useUserStore from '@/store/userStore';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Dialog, Label, RadioGroup, useThemeColor } from 'heroui-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import CodeHighlighter from 'react-native-code-highlighter';
import ConfettiCannon from 'react-native-confetti-cannon';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { anOldHope as style } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const CODE_BG = '#1e1e1e';
const LINE_BG = '#25262a';

type CheckStatus = 'idle' | 'correct' | 'wrong';

function getCodeLanguage(packId: string): string {
  if (packId.includes('ts-') || packId.includes('dotnet')) return 'typescript';
  if (packId.includes('rust')) return 'rust';
  if (packId.includes('go-')) return 'go';
  if (packId.includes('react')) return 'javascript';
  return 'javascript';
}

export default function QuizScreen() {
  const { id, packId } = useLocalSearchParams<{ id: string; packId?: string }>();
  const router = useRouter();
  const muted = useThemeColor('muted');
  const accent = useThemeColor('accent');
  const danger = useThemeColor('danger');
  const background = useThemeColor('background');
  const foreground = useThemeColor('foreground');

  const dailyState = useUserStore((s) => s.dailyState);
  const ensureDailySet = useUserStore((s) => s.ensureDailySet);
  const submitDailyAnswer = useUserStore((s) => s.submitDailyAnswer);
  const markSnippetCompleted = useUserStore((s) => s.markSnippetCompleted);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<CheckStatus>('idle');
  const [isChecking, setIsChecking] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [nextQuestionId, setNextQuestionId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<ConfettiCannon>(null);

  const insets = useSafeAreaInsets();
  const currentPackId = typeof packId === 'string' && packId.length > 0 ? packId : null;
  const isPackMode = !!currentPackId;
  const requestedId = typeof id === 'string' ? id : null;
  const idFromSet = dailyState.questionIds[dailyState.currentIndex];
  const activeId =
    isPackMode
      ? requestedId
      : requestedId && dailyState.questionIds.includes(requestedId)
        ? requestedId
        : idFromSet;
  const data = activeId ? getSnippetWithPackById(activeId) : null;
  const snippet = data?.snippet;
  const pack = data?.pack;

  const correctAnswerId = snippet?.correctAnswerId ?? '';
  const isCorrect = status === 'correct';
  const isWrong = status === 'wrong';

  const handleCheck = useCallback(() => {
    if (selectedOption === null || !snippet || !activeId) return;
    setIsChecking(true);
    const correct = selectedOption === correctAnswerId;
    setStatus(correct ? 'correct' : 'wrong');
    if (isPackMode) {
      setNextQuestionId(null);
    } else {
      const submitResult = submitDailyAnswer(activeId, correct, selectedOption);
      setNextQuestionId(submitResult.nextQuestionId);
    }

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowConfetti(true);
      setTimeout(() => confettiRef.current?.start(), 100);
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setIsChecking(false);
    setTimeout(() => setIsResultDialogOpen(true), 300);
  }, [
    selectedOption,
    snippet,
    activeId,
    correctAnswerId,
    isPackMode,
    submitDailyAnswer,
  ]);

  useEffect(() => {
    if (!isPackMode) ensureDailySet();
  }, [ensureDailySet, isPackMode]);

  if (!data || !snippet || !pack) {
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <ThemedText style={[styles.errorText, { color: muted }]}>
          Question not found.
        </ThemedText>
        <Button onPress={() => router.back()}>
          <Button.Label>Go back</Button.Label>
        </Button>
      </View>
    );
  }

  const codeLang = getCodeLanguage(pack.id);

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top / 2.5 }]}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <IconSymbol name="xmark" size={24} color={foreground} />
        </Pressable>
        <ThemedText style={[styles.topBarTitle, { color: foreground }]}>
          Quiz
        </ThemedText>
        <View style={styles.closeButton} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <ThemedText style={[styles.headerLabel, { color: muted }]}>
            {isPackMode
              ? 'Practice Mode'
              : `Daily Challenge ${dailyState.currentIndex + 1} / 3`}
          </ThemedText>
          <ThemedText style={[styles.packLabel, { color: accent }]}>
            {pack.title}
          </ThemedText>
        </View>
        {!isPackMode && (
          <View style={styles.dailyProgressDots}>
            {dailyState.results.map((result, index) => {
              const backgroundColor =
                result === 1 ? accent : result === 2 ? danger : 'transparent';
              return (
                <View
                  key={index}
                  style={[
                    styles.dailyProgressDot,
                    { borderColor: muted + '90', backgroundColor },
                  ]}
                />
              );
            })}
          </View>
        )}

        <ThemedText style={[styles.questionText, { color: foreground }]}>
          {snippet.question}
        </ThemedText>

        {/* Code Viewer — IDE-like */}
        <View style={styles.codeContainer}>
          <View style={[styles.codeHeader, { backgroundColor: LINE_BG }]}>
            <View style={styles.codeDots}>
              <View style={[styles.dot, { backgroundColor: '#ff5f56' }]} />
              <View style={[styles.dot, { backgroundColor: '#ffbd2e' }]} />
              <View style={[styles.dot, { backgroundColor: '#27c93f' }]} />
            </View>
            <ThemedText style={[styles.codeFilename, { color: muted }]}>
              snippet.{codeLang === 'typescript' ? 'ts' : 'js'}
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

        {/* Options */}
        <View style={styles.optionsBlock}>
          <RadioGroup
            value={selectedOption ?? undefined}
            onValueChange={(v) => {
              if (status === 'idle') setSelectedOption(v);
            }}
          >
            {snippet.answers.map((opt) => {
              const optId = opt.id;
              const isSelected = selectedOption === optId;
              const isOptCorrect = status !== 'idle' && optId === correctAnswerId;
              const isOptWrong =
                status !== 'idle' && isSelected && optId !== correctAnswerId;
              const borderColor = isOptCorrect
                ? accent
                : isOptWrong
                  ? danger
                  : isSelected
                    ? muted
                    : muted + '20';
              return (
                <RadioGroup.Item
                  key={optId}
                  value={optId}
                  style={[
                    styles.optionItem,
                    { backgroundColor: muted + '10', borderColor },
                  ]}
                >
                  <RadioGroup.Indicator>
                    {isSelected && (
                      <Animated.View entering={FadeIn}>
                        <IconSymbol
                          name="checkmark"
                          size={12}
                          color="white"
                        />
                      </Animated.View>
                    )}
                  </RadioGroup.Indicator>
                  <Label>{opt.text}</Label>
                </RadioGroup.Item>
              );
            })}
          </RadioGroup>
        </View>

        {/* Action button */}
        <Button
          style={styles.checkButton}
          isDisabled={
            selectedOption === null || status !== 'idle' || isChecking
          }
          onPress={handleCheck}
        >
          <Button.Label style={styles.checkButtonLabel}>
            {isChecking ? 'Checking…' : status !== 'idle' ? 'Answered' : 'Check Answer'}
          </Button.Label>
        </Button>

        {showConfetti && (
          <ConfettiCannon
            ref={confettiRef}
            count={120}
            origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
            fadeOut
            autoStart={false}
          />
        )}
      </ScrollView>

      <Dialog isOpen={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <View style={styles.sheetHeader}>
              <Dialog.Title
                style={[
                  styles.sheetTitle,
                  { color: isCorrect ? accent : danger },
                ]}
              >
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </Dialog.Title>
              <Dialog.Description style={[styles.sheetBody, { color: foreground }]}>
                {isWrong
                  ? (snippet.explanation ??
                    `The correct answer was: ${snippet.answers.find((a) => a.id === correctAnswerId)?.text ?? ''}`)
                  : 'Great work. Ready for the next one?'}
              </Dialog.Description>
            </View>
            <Button
              onPress={() => {
                setIsResultDialogOpen(false);
                if (isPackMode) {
                  if (currentPackId && activeId) {
                    markSnippetCompleted(currentPackId, activeId, isCorrect, selectedOption ?? undefined);
                  }
                  router.back();
                  return;
                }
                if (nextQuestionId) {
                  setSelectedOption(null);
                  setStatus('idle');
                  setNextQuestionId(null);
                  router.replace({
                    pathname: '/quiz/[id]',
                    params: { id: nextQuestionId },
                  });
                  return;
                }
                router.replace('/daily/results' as never);
              }}
            >
              <Button.Label>
                {isPackMode
                  ? 'Back to Pack'
                  : isWrong
                    ? 'Got it'
                    : nextQuestionId
                      ? 'Continue'
                      : 'View Results'}
              </Button.Label>
            </Button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dailyProgressDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  dailyProgressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  packLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  codeContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 24,
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
  optionsBlock: {
    gap: 12,
    marginBottom: 24,
  },
  optionItem: {
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderWidth: 1,
  },
  checkButton: {
    marginTop: 8,
  },
  checkButtonLabel: {
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  sheetHeader: {
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  sheetBody: {
    fontSize: 16,
    lineHeight: 24,
  },
});
