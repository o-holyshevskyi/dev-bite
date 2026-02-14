import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import useUserStore, { type ActivityEntry } from '@/store/userStore';
import { useRouter } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

function ActivityRow({ item }: { item: ActivityEntry }) {
  const foreground = useThemeColor('foreground');
  const muted = useThemeColor('muted');
  const success = useThemeColor('success');
  const accent = useThemeColor('accent');
  const iconName = item.type === 'daily' ? 'bolt.fill' : 'shippingbox.fill';
  const iconColor = item.type === 'daily' ? accent : muted;

  return (
    <View
      style={[
        styles.rowCard,
        {
          borderColor: accent + '33',
          backgroundColor: accent + '10',
        },
      ]}
    >
      <View style={[styles.typeIconWrap, { backgroundColor: accent + '24' }]}>
        <IconSymbol name={iconName} size={16} color={iconColor} />
      </View>
      <View style={styles.rowContent}>
        <ThemedText style={[styles.rowTitle, { color: foreground }]}>
          {item.title}
        </ThemedText>
        <ThemedText style={[styles.rowDate, { color: muted }]}>
          {formatActivityTimestamp(item.timestamp)}
        </ThemedText>
      </View>
      <ThemedText style={[styles.rowXp, { color: success }]}>
        +{item.xpGained} XP
      </ThemedText>
    </View>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const foreground = useThemeColor('foreground');
  const muted = useThemeColor('muted');
  const background = useThemeColor('background');
  const activityLog = useUserStore((state) => state.activityLog);

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
        data={activityLog}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <ActivityRow item={item} />}
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
