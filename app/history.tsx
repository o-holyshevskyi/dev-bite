import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import { getSnippetWithPackById } from '@/src/data/mockData';
import useUserStore, { type ActivityEntry } from '@/store/userStore';
import { useRouter } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

type HistoryFilter = 'all' | 'correct' | 'incorrect';
type GroupCategory = 'daily-question' | 'practice-question';
type HistoryListEntry = ActivityEntry & {
  grouped?: boolean;
  groupKey?: string;
  children?: ActivityEntry[];
  isChild?: boolean;
  activityEntryId?: string;
  sourceEntryIds?: string[];
  representativeEntryId?: string;
};

function getLocalDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getGroupCategory(entry: ActivityEntry): GroupCategory | null {
  if (entry.title === 'Daily Question Correct' || entry.title === 'Daily Question Incorrect') {
    return 'daily-question';
  }
  if (
    entry.title === 'Practice Snippet Solved' ||
    entry.title === 'Practice Snippet Attempted'
  ) {
    return 'practice-question';
  }
  return null;
}

function formatActivityTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isSameDay) {
    const time = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
    return `Today, ${time}`;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function ActivityRow({
  item,
  index,
  isExpanded,
  onToggleGroup,
}: {
  item: HistoryListEntry;
  index: number;
  isExpanded: boolean;
  onToggleGroup: (groupKey: string) => void;
}) {
  const router = useRouter();
  const foreground = useThemeColor('foreground');
  const muted = useThemeColor('muted');
  const success = useThemeColor('success');
  const accent = useThemeColor('accent');
  const isGroupRow = !!item.grouped && !item.isChild;
  const isChildRow = !!item.isChild;
  const iconName = isChildRow
    ? 'doc.text.fill'
    : item.type === 'daily'
      ? 'bolt.fill'
      : 'shippingbox.fill';
  const iconColor = item.type === 'daily' ? accent : muted;
  const detailTarget = item.activityEntryId ?? item.representativeEntryId ?? item.id;
  const childSnippet = item.snippetId ? getSnippetWithPackById(item.snippetId)?.snippet : null;
  const title = isChildRow && childSnippet ? childSnippet.question : item.title;
  const handlePress = () => {
    if (isGroupRow && item.groupKey) {
      onToggleGroup(item.groupKey);
      return;
    }
    router.push(`/history/${detailTarget}` as never);
  };

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 30, 240)).duration(220)}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <View
          style={[
            styles.rowCard,
            {
              marginLeft: isChildRow ? 16 : 0,
              borderColor: accent + '33',
              backgroundColor: isChildRow ? accent + '08' : accent + '10',
            },
          ]}
        >
          <View style={[styles.typeIconWrap, { backgroundColor: accent + '24' }]}>
            <IconSymbol name={iconName} size={16} color={iconColor} />
          </View>
          <View style={styles.rowContent}>
            <ThemedText style={[styles.rowTitle, { color: foreground }]}>
              {title}
            </ThemedText>
            <ThemedText style={[styles.rowDate, { color: muted }]}>
              {formatActivityTimestamp(item.timestamp)}
            </ThemedText>
          </View>
          <View style={styles.rowRight}>
            <ThemedText style={[styles.rowXp, { color: success }]}>
              +{item.xpGained} XP
            </ThemedText>
            <IconSymbol
              name={isGroupRow ? (isExpanded ? 'chevron.down' : 'chevron.right') : 'chevron.right'}
              size={14}
              color={muted}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function FilterCountLabel({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <View style={styles.filterLabelRow}>
      <ThemedText style={[styles.filterText, { color }]}>{label}</ThemedText>
      <Animated.View
        key={`${label}-${count}`}
        entering={FadeInDown.duration(160)}
        exiting={FadeOutUp.duration(120)}
      >
        <ThemedText style={[styles.filterText, { color }]}>({count})</ThemedText>
      </Animated.View>
    </View>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const foreground = useThemeColor('foreground');
  const muted = useThemeColor('muted');
  const accent = useThemeColor('accent');
  const success = useThemeColor('success');
  const danger = useThemeColor('danger');
  const background = useThemeColor('background');
  const activityLog = useUserStore((state) => state.activityLog);
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [expandedGroupKeys, setExpandedGroupKeys] = useState<string[]>([]);
  const visibleActivityLog = useMemo(
    () => activityLog.filter((entry) => entry.title !== 'Daily Challenge Completed'),
    [activityLog],
  );

  const resolveEntryCorrectness = (entry: ActivityEntry): boolean | null => {
    if (entry.snippetId && entry.userAnswerId) {
      const resolved = getSnippetWithPackById(entry.snippetId);
      if (resolved?.snippet) {
        return resolved.snippet.correctAnswerId === entry.userAnswerId;
      }
    }

    if (entry.title.includes('Incorrect')) return false;
    if (entry.title.includes('Correct') || entry.title.includes('Solved')) return true;
    return null;
  };

  const groupActivityEntries = (entries: ActivityEntry[]): HistoryListEntry[] => {
    const grouped = new Map<
      string,
      {
        index: number;
        count: number;
        correctCount: number;
        incorrectCount: number;
      }
    >();
    const result: HistoryListEntry[] = [];

    for (const entry of entries) {
      const category = getGroupCategory(entry);
      if (!category) {
        result.push(entry);
        continue;
      }

      const groupKey = `${category}:${getLocalDateKey(entry.timestamp)}`;
      const existing = grouped.get(groupKey);
      const correctness = resolveEntryCorrectness(entry);
      const correctDelta = correctness === true ? 1 : 0;
      const incorrectDelta = correctness === false ? 1 : 0;

      if (!existing) {
        const baseTitle =
          category === 'daily-question'
            ? 'Daily Questions'
            : 'Practice Questions';
        result.push({
          ...entry,
          grouped: true,
          groupKey,
          children: [entry],
          sourceEntryIds: [entry.id],
          representativeEntryId: entry.id,
          title: `${baseTitle} Answered (1)`,
        });
        grouped.set(groupKey, {
          index: result.length - 1,
          count: 1,
          correctCount: correctDelta,
          incorrectCount: incorrectDelta,
        });
        continue;
      }

      const target = result[existing.index];
      const nextCount = existing.count + 1;
      const nextCorrect = existing.correctCount + correctDelta;
      const nextIncorrect = existing.incorrectCount + incorrectDelta;
      const baseTitle =
        category === 'daily-question'
          ? 'Daily Questions'
          : 'Practice Questions';
      const statusLabel =
        nextIncorrect === 0
          ? 'Correct'
          : nextCorrect === 0
            ? 'Incorrect'
            : 'Answered';

      result[existing.index] = {
        ...target,
        xpGained: target.xpGained + entry.xpGained,
        children: [...(target.children ?? []), entry],
        sourceEntryIds: [...(target.sourceEntryIds ?? []), entry.id],
        title: `${baseTitle} ${statusLabel} (${nextCount})`,
      };
      grouped.set(groupKey, {
        index: existing.index,
        count: nextCount,
        correctCount: nextCorrect,
        incorrectCount: nextIncorrect,
      });
    }

    return result;
  };

  const correctEntries = useMemo(
    () =>
      visibleActivityLog.filter((entry) => {
        const correctness = resolveEntryCorrectness(entry);
        return correctness === true;
      }),
    [visibleActivityLog],
  );
  const incorrectEntries = useMemo(
    () =>
      visibleActivityLog.filter((entry) => {
        const correctness = resolveEntryCorrectness(entry);
        return correctness === false;
      }),
    [visibleActivityLog],
  );

  const groupedAllEntries = useMemo(
    () => groupActivityEntries(visibleActivityLog),
    [visibleActivityLog],
  );
  const groupedCorrectEntries = useMemo(
    () => groupActivityEntries(correctEntries),
    [correctEntries],
  );
  const groupedIncorrectEntries = useMemo(
    () => groupActivityEntries(incorrectEntries),
    [incorrectEntries],
  );

  const filteredActivityLog = useMemo(() => {
    if (filter === 'all') return groupedAllEntries;
    if (filter === 'correct') return groupedCorrectEntries;
    return groupedIncorrectEntries;
  }, [filter, groupedAllEntries, groupedCorrectEntries, groupedIncorrectEntries]);
  const visibleEntries = useMemo(() => {
    const flattened: HistoryListEntry[] = [];

    for (const entry of filteredActivityLog) {
      flattened.push(entry);
      if (!entry.grouped || !entry.groupKey) continue;
      if (!expandedGroupKeys.includes(entry.groupKey)) continue;

      for (const child of entry.children ?? []) {
        flattened.push({
          ...child,
          id: `${entry.groupKey}:${child.id}`,
          isChild: true,
          activityEntryId: child.id,
        });
      }
    }

    return flattened;
  }, [filteredActivityLog, expandedGroupKeys]);
  const counts = useMemo(
    () => ({
      all: groupedAllEntries.length,
      correct: groupedCorrectEntries.length,
      incorrect: groupedIncorrectEntries.length,
    }),
    [groupedAllEntries.length, groupedCorrectEntries.length, groupedIncorrectEntries.length],
  );
  const toggleGroup = (groupKey: string) => {
    setExpandedGroupKeys((current) =>
      current.includes(groupKey)
        ? current.filter((key) => key !== groupKey)
        : [...current, groupKey],
    );
  };

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
          Activity History
        </ThemedText>
        <View style={styles.rightSpacer} />
      </View>

      <FlatList
        data={visibleEntries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.filters}>
            <Pressable
              onPress={() => setFilter('all')}
              style={[
                styles.filterChip,
                {
                  borderColor: filter === 'all' ? accent : muted + '33',
                  backgroundColor: filter === 'all' ? accent + '20' : 'transparent',
                },
              ]}
            >
              <ThemedText
                style={styles.hiddenFilterTextForHeight}
              />
              <FilterCountLabel
                label="All"
                count={counts.all}
                color={filter === 'all' ? accent : muted}
              />
            </Pressable>
            <Pressable
              onPress={() => setFilter('correct')}
              style={[
                styles.filterChip,
                {
                  borderColor: filter === 'correct' ? success : muted + '33',
                  backgroundColor: filter === 'correct' ? success + '20' : 'transparent',
                },
              ]}
            >
              <ThemedText
                style={styles.hiddenFilterTextForHeight}
              />
              <FilterCountLabel
                label="Correct"
                count={counts.correct}
                color={filter === 'correct' ? success : muted}
              />
            </Pressable>
            <Pressable
              onPress={() => setFilter('incorrect')}
              style={[
                styles.filterChip,
                {
                  borderColor: filter === 'incorrect' ? danger : muted + '33',
                  backgroundColor: filter === 'incorrect' ? danger + '20' : 'transparent',
                },
              ]}
            >
              <ThemedText
                style={styles.hiddenFilterTextForHeight}
              />
              <FilterCountLabel
                label="Incorrect"
                count={counts.incorrect}
                color={filter === 'incorrect' ? danger : muted}
              />
            </Pressable>
          </View>
        }
        renderItem={({ item, index }) => (
          <ActivityRow
            item={item}
            index={index}
            isExpanded={!!item.groupKey && expandedGroupKeys.includes(item.groupKey)}
            onToggleGroup={toggleGroup}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText style={[styles.emptyTitle, { color: foreground }]}>
              No activity yet.
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: muted }]}>
              Start coding to earn XP!
            </ThemedText>
          </View>
        }
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
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  filterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hiddenFilterTextForHeight: {
    height: 0,
    opacity: 0,
    fontSize: 12,
    fontWeight: '700',
  },
  rowCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowDate: {
    marginTop: 3,
    fontSize: 12,
  },
  rowXp: {
    fontSize: 14,
    fontWeight: '700',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});
