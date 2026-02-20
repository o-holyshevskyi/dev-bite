import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import useUserStore from '@/store/userStore';
import { getLevelPerformance, type LevelPerformanceSummary } from '@/src/utils/learning-path';
import * as Haptics from 'expo-haptics';
import { Button, Dialog, useThemeColor } from 'heroui-native';
import { useEffect, useRef } from 'react';
import { Dimensions, View, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

type LevelCompleteModalProps = {
  level: { category: string; difficulty: string } | null;
  onDismiss: () => void;
};

function formatDifficulty(d: string): string {
  if (!d) return d;
  return d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
}

export function LevelCompleteModal({ level, onDismiss }: LevelCompleteModalProps) {
  const accent = useThemeColor('accent');
  const foreground = useThemeColor('foreground');
  const muted = useThemeColor('muted');
  const success = useThemeColor('success');
  const packProgress = useUserStore((state) => state.packProgress);
  const confettiRef = useRef<ConfettiCannon>(null);

  const isOpen = level !== null;
  const summary: LevelPerformanceSummary | null =
    level && packProgress.length > 0
      ? getLevelPerformance(level.category, level.difficulty as LevelPerformanceSummary['difficulty'], packProgress)
      : null;

  useEffect(() => {
    if (!isOpen || !level) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const t = setTimeout(() => {
      confettiRef.current?.start();
    }, 100);
    return () => clearTimeout(t);
  }, [isOpen, level?.category, level?.difficulty]);

  const handleOpenChange = (open: boolean) => {
    if (!open) onDismiss();
  };

  if (!level) return null;

  return (
    <>
      {isOpen && (
        <ConfettiCannon
          ref={confettiRef}
          count={120}
          origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
          fadeOut
          autoStart={false}
        />
      )}
      <Dialog isOpen={isOpen} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <View style={styles.content}>
              <View style={[styles.iconWrap, { backgroundColor: success + '24' }]}>
                <IconSymbol name="checkmark.circle.fill" size={48} color={success} />
              </View>
              <ThemedText style={[styles.title, { color: foreground }]}>
                Level complete!
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: accent }]}>
                {level.category} • {formatDifficulty(level.difficulty)}
              </ThemedText>
              {summary && (
                <View style={[styles.statsBox, { borderColor: muted + '40', backgroundColor: muted + '12' }]}>
                  <ThemedText style={[styles.statsLine, { color: foreground }]}>
                    {summary.completed}/{summary.total} snippets completed
                  </ThemedText>
                  {summary.incorrect > 0 && (
                    <ThemedText style={[styles.statsLine, { color: muted }]}>
                      {summary.incorrect} incorrect attempt{summary.incorrect !== 1 ? 's' : ''}
                    </ThemedText>
                  )}
                  <ThemedText style={[styles.statsLine, { color: accent }]}>
                    {summary.accuracyPercent}% accuracy
                  </ThemedText>
                </View>
              )}
              <Button onPress={() => handleOpenChange(false)} style={styles.button}>
                <Button.Label>Continue</Button.Label>
              </Button>
            </View>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsBox: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 6,
  },
  statsLine: {
    fontSize: 15,
    fontWeight: '600',
  },
  button: {
    alignSelf: 'stretch',
  },
});
