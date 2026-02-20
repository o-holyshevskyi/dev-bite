import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import { quizPacks, type Difficulty } from '@/src/data/mockData';
import useUserStore from '@/store/userStore';
import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useThemeColor } from 'heroui-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useAnimatedProps,
  useSharedValue,
  withTiming,
  withDelay,
  withRepeat,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NODE_SIZE = 112;
const RING_STROKE = 10;
const RADIUS = (NODE_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DIFFICULTY_ORDER: Difficulty[] = [
  'easy',
  'medium',
  'hard',
  'advanced',
  'expert',
  'master',
  'principal',
];

/** Cool → warm gradient by level rank (Easy = cool, Principal = warm). */
const LEVEL_GRADIENT_COLORS: string[] = [
  '#3b82f6', // easy - blue
  '#06b6d4', // medium - cyan
  '#10b981', // hard - emerald
  '#84cc16', // advanced - lime
  '#eab308', // expert - yellow
  '#f97316', // master - orange
  '#ef4444', // principal - red
];

function getLevelRankColor(difficulty: Difficulty): string {
  const i = DIFFICULTY_ORDER.indexOf(difficulty);
  return LEVEL_GRADIENT_COLORS[Math.max(0, Math.min(i, LEVEL_GRADIENT_COLORS.length - 1))] ?? LEVEL_GRADIENT_COLORS[0];
}

const LANES_X = [150, 420, 690];
const GROUP_HEIGHT = 1240;
const NODE_VERTICAL_GAP = 160;
const LEVEL_LINK_OVERLAP = 10;
const EDGE_RESISTANCE = 0.22;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const CATEGORY_DEPENDENCIES: Array<{ from: string; to: string }> = [
  { from: 'TypeScript', to: 'React' },
];

type ChapterNode = {
  id: string;
  category: string;
  difficulty: Difficulty;
  lane: number;
  x: number;
  y: number;
  progress: number;
  isCompleted: boolean;
  isAvailable: boolean;
  hasContent: boolean;
};

function normalizeCategory(category: string): string {
  return category.trim().toLowerCase();
}

function categoryIcon(category: string): string {
  const key = normalizeCategory(category);
  if (key.includes('react')) return 'atom';
  if (key.includes('typescript')) return 'chevron.left.forwardslash.chevron.right';
  if (key.includes('go')) return 'bolt.horizontal';
  if (key.includes('python')) return 'moon.stars';
  if (key.includes('logic')) return 'brain.head.profile';
  return 'sparkles';
}

/** Icon shown when the node is mastered (100%). */
const MASTERED_ICON = 'star.fill';
const MASTERED_ICON_COLOR = '#f5c453';

function getCurvedDependencyPath(x1: number, y1: number, x2: number, y2: number): string {
  const controlX = (x1 + x2) / 2;
  const controlY = Math.min(y1, y2) - 90;
  return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

type PathNodeProps = {
  node: ChapterNode;
  index: number;
  animationCycle: number;
  levelColor: string;
  isSuggested: boolean;
  onPress: () => void;
};

function PathNode({
  node,
  index,
  animationCycle,
  levelColor,
  isSuggested,
  onPress,
}: PathNodeProps) {
  const ringProgress = node.progress;
  const isMastered = node.isCompleted && ringProgress >= 100;
  const iconName = isMastered ? MASTERED_ICON : categoryIcon(node.category);
  const iconTint = isMastered ? MASTERED_ICON_COLOR : (node.isAvailable ? '#f5f5f5' : '#7d7d7d');
  const trackTint = node.isAvailable ? '#2b2b2b' : '#2f2f2f';
  const progressTint = levelColor;
  const fillTint = node.isAvailable ? '#0f0f0f' : '#1a1a1a';
  const animatedProgress = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = 0;
    animatedProgress.value = withDelay(
      index * 90,
      withTiming(ringProgress, {
        duration: 750,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [animatedProgress, animationCycle, index, ringProgress]);

  const animatedRingProps = useAnimatedProps(() => ({
    strokeDashoffset:
      CIRCUMFERENCE - (animatedProgress.value / 100) * CIRCUMFERENCE,
  }));

  useEffect(() => {
    if (isSuggested && node.isAvailable && node.hasContent) {
      pulse.value = 0;
      pulse.value = withRepeat(
        withTiming(1, {
          duration: 950,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      );
      return;
    }

    cancelAnimation(pulse);
    pulse.value = 0;
  }, [isSuggested, node.hasContent, node.isAvailable, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + (1 - pulse.value) * 0.2,
    transform: [{ scale: 1 + pulse.value * 0.12 }],
  }));

  return (
    <View style={[styles.nodeAbsolute, { left: node.x - NODE_SIZE / 2, top: node.y - NODE_SIZE / 2 }]}>
      <Pressable
        disabled={!node.isAvailable || !node.hasContent}
        onPress={onPress}
        style={({ pressed }) => [styles.nodePressable, pressed && node.isAvailable && styles.nodePressed]}
      >
        <View style={[styles.nodeShell, node.isCompleted && styles.nodeCompleteGlow, !node.isAvailable && styles.nodeLocked]}>
          {isSuggested && node.isAvailable && node.hasContent ? (
            <Animated.View
              pointerEvents="none"
              style={[styles.pulseHalo, { borderColor: levelColor }, pulseStyle]}
            />
          ) : null}
          <Svg width={NODE_SIZE} height={NODE_SIZE} style={styles.progressRing}>
            <Circle
              cx={NODE_SIZE / 2}
              cy={NODE_SIZE / 2}
              r={RADIUS}
              stroke={trackTint}
              strokeWidth={RING_STROKE}
              fill="transparent"
            />
            <AnimatedCircle
              cx={NODE_SIZE / 2}
              cy={NODE_SIZE / 2}
              r={RADIUS}
              stroke={progressTint}
              strokeWidth={RING_STROKE}
              fill="transparent"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              animatedProps={animatedRingProps}
              strokeLinecap="round"
              originX={NODE_SIZE / 2}
              originY={NODE_SIZE / 2}
              rotation={-90}
            />
          </Svg>

          <View style={[styles.nodeCore, { backgroundColor: fillTint }]}>
            <IconSymbol name={iconName as any} size={30} color={iconTint} />
            <ThemedText style={[styles.nodePercent, !node.isAvailable && styles.nodePercentLocked]}>
              {Math.round(ringProgress)}%
            </ThemedText>
          </View>

          {!node.isAvailable ? (
            <View style={styles.lockBadge}>
              <IconSymbol name="lock.fill" size={13} color="#8d8d8d" />
            </View>
          ) : null}
        </View>

        <ThemedText style={[styles.chapterLabelTop, !node.isAvailable && styles.nodeLabelLocked]}>
          {node.difficulty.toUpperCase()}
        </ThemedText>
      </Pressable>
    </View>
  );
}

export function LearningPathScreen({ showBackButton = true }: { showBackButton?: boolean }) {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string | string[]; difficulty?: string | string[] }>();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const accent = useThemeColor('accent');
  const warning = useThemeColor('warning');
  const packProgress = useUserStore((state) => state.packProgress);
  const [animationCycle, setAnimationCycle] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const panStartX = useSharedValue(0);
  const panStartY = useSharedValue(0);
  const zoomScale = useSharedValue(1);
  const pinchStartScale = useSharedValue(1);
  const selectedCategoryParam = Array.isArray(params.category) ? params.category[0] : params.category;
  const selectedDifficultyParam = Array.isArray(params.difficulty) ? params.difficulty[0] : params.difficulty;

  useEffect(() => {
    if (isFocused) setAnimationCycle((value) => value + 1);
  }, [isFocused]);

  const categoryOrder = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const pack of quizPacks) {
      const category = pack.category ?? pack.language;
      const key = normalizeCategory(category);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      ordered.push(category);
    }
    return ordered;
  }, []);

  const chapterProgress = useMemo(() => {
    const progressMap: Record<string, { progress: number; hasContent: boolean }> = {};

    for (const category of categoryOrder) {
      for (const difficulty of DIFFICULTY_ORDER) {
        const packs = quizPacks.filter(
          (pack) =>
            normalizeCategory(pack.category ?? pack.language) === normalizeCategory(category) &&
            pack.difficulty === difficulty,
        );
        const hasContent = packs.length > 0;
        const totalSnippets = packs.reduce((sum, pack) => sum + pack.snippets.length, 0);
        const completedSnippetIds = new Set<string>();

        for (const pack of packs) {
          const progress = packProgress.find((item) => item.packId === pack.id);
          (progress?.completedSnippetIds ?? []).forEach((id) => completedSnippetIds.add(id));
        }

        const progressPercent =
          totalSnippets > 0
            ? Math.min(100, Math.max(0, (completedSnippetIds.size / totalSnippets) * 100))
            : 0;

        progressMap[`${category}:${difficulty}`] = {
          progress: progressPercent,
          hasContent,
        };
      }
    }

    return progressMap;
  }, [categoryOrder, packProgress]);

  const nodes = useMemo(() => {
    const list: ChapterNode[] = [];

    categoryOrder.forEach((category, categoryIndex) => {
      const lane = categoryIndex % 3;
      const groupIndex = Math.floor(categoryIndex / 3);
      const baseY = 170 + groupIndex * GROUP_HEIGHT;
      const easyProgress = chapterProgress[`${category}:easy`]?.progress ?? 0;
      const mediumProgress = chapterProgress[`${category}:medium`]?.progress ?? 0;

      DIFFICULTY_ORDER.forEach((difficulty, difficultyIndex) => {
        const key = `${category}:${difficulty}`;
        const progress = chapterProgress[key]?.progress ?? 0;
        const hasContent = chapterProgress[key]?.hasContent ?? false;
        const previousDifficultyIndex = DIFFICULTY_ORDER.indexOf(difficulty) - 1;
        const previousDifficulty =
          previousDifficultyIndex >= 0 ? DIFFICULTY_ORDER[previousDifficultyIndex] : null;
        const previousProgress = previousDifficulty
          ? chapterProgress[`${category}:${previousDifficulty}`]?.progress ?? 0
          : 100;
        const isAvailable = previousProgress >= 100;

        list.push({
          id: key,
          category,
          difficulty,
          lane,
          x: LANES_X[lane],
          y: baseY + difficultyIndex * NODE_VERTICAL_GAP,
          progress,
          hasContent,
          isCompleted: progress >= 100,
          isAvailable,
        });
      });
    });

    return list;
  }, [categoryOrder, chapterProgress]);

  const canvasSize = useMemo(() => {
    const groups = Math.max(1, Math.ceil(categoryOrder.length / 3));
    return {
      width: 840,
      height: groups * GROUP_HEIGHT + 160,
    };
  }, [categoryOrder.length]);

  const getPanBounds = (scale: number) => {
    const scaledWidth = canvasSize.width * scale;
    const scaledHeight = canvasSize.height * scale;

    const minX =
      scaledWidth <= viewportSize.width
        ? (viewportSize.width - scaledWidth) / 2
        : viewportSize.width - scaledWidth;
    const maxX =
      scaledWidth <= viewportSize.width ? (viewportSize.width - scaledWidth) / 2 : 0;

    const minY =
      scaledHeight <= viewportSize.height
        ? (viewportSize.height - scaledHeight) / 2
        : viewportSize.height - scaledHeight;
    const maxY =
      scaledHeight <= viewportSize.height ? (viewportSize.height - scaledHeight) / 2 : 0;

    return { minX, maxX, minY, maxY };
  };

  const categoryBlockLabels = useMemo(() => {
    return categoryOrder.flatMap((category) => {
      const easyNode = nodes.find(
        (node) => node.category === category && node.difficulty === 'easy',
      );
      if (!easyNode) return [];

      return [
        {
          id: `label:${category}`,
          category,
          x: easyNode.x,
          y: easyNode.y - NODE_SIZE / 2 - 52,
        },
      ];
    });
  }, [categoryOrder, nodes]);

  const levelConnections = useMemo(() => {
    return nodes.flatMap((node) => {
      const fromDiffIndex = DIFFICULTY_ORDER.indexOf(node.difficulty);
      if (fromDiffIndex === DIFFICULTY_ORDER.length - 1) return [];

      const nextDifficulty = DIFFICULTY_ORDER[fromDiffIndex + 1];
      const nextNode = nodes.find(
        (item) =>
          item.category === node.category &&
          item.difficulty === nextDifficulty,
      );
      if (!nextNode) return [];
      return [{ from: node, to: nextNode, isActive: node.isCompleted }];
    });
  }, [nodes]);

  const dependencyConnections = useMemo(() => {
    return CATEGORY_DEPENDENCIES.flatMap((dependency) => {
      const sourceNode = nodes.find(
        (node) =>
          normalizeCategory(node.category) === normalizeCategory(dependency.from) &&
          node.difficulty === 'easy',
      );
      const targetNode = nodes.find(
        (node) =>
          normalizeCategory(node.category) === normalizeCategory(dependency.to) &&
          node.difficulty === 'easy',
      );

      if (!sourceNode || !targetNode) return [];
      if (!sourceNode.isCompleted) return [];

      return [{ from: sourceNode, to: targetNode }];
    });
  }, [nodes]);

  const firstIncompleteUnlockedNode = useMemo(() => {
    const normalizedRequestedCategory = (selectedCategoryParam ?? '').trim().toLowerCase();
    const normalizedRequestedDifficulty = (selectedDifficultyParam ?? '').trim().toLowerCase();
    if (normalizedRequestedCategory.length > 0) {
      const scopedNodes = nodes.filter(
        (node) => normalizeCategory(node.category) === normalizedRequestedCategory,
      );
      const requestedNode =
        normalizedRequestedDifficulty.length > 0
          ? scopedNodes.find((node) => node.difficulty === normalizedRequestedDifficulty)
          : null;
      if (requestedNode) return requestedNode;
      const preferred =
        scopedNodes.find((node) => node.isAvailable && node.hasContent && node.progress < 100) ??
        scopedNodes.find((node) => node.isAvailable && node.hasContent) ??
        scopedNodes[0] ??
        null;
      if (preferred) return preferred;
    }

    return (
      nodes.find((node) => node.isAvailable && node.hasContent && node.progress < 100) ??
      nodes.find((node) => node.isAvailable && node.hasContent) ??
      nodes[0] ??
      null
    );
  }, [nodes, selectedCategoryParam, selectedDifficultyParam]);

  useEffect(() => {
    if (!isFocused || !firstIncompleteUnlockedNode) return;
    if (viewportSize.width <= 0 || viewportSize.height <= 0) return;

    const { minX, maxX, minY, maxY } = getPanBounds(zoom);
    const targetX = clamp(viewportSize.width / 2 - firstIncompleteUnlockedNode.x * zoom, minX, maxX);
    const targetY = clamp(viewportSize.height / 2 - firstIncompleteUnlockedNode.y * zoom, minY, maxY);
    panX.value = withTiming(targetX, { duration: 260 });
    panY.value = withTiming(targetY, { duration: 260 });
  }, [firstIncompleteUnlockedNode, isFocused, panX, panY, viewportSize.height, viewportSize.width, zoom]);

  const handleNodePress = (node: ChapterNode) => {
    if (!node.isAvailable || !node.hasContent) return;
    router.push({
      pathname: '/(tabs)/explore',
      params: { category: node.category, difficulty: node.difficulty },
    });
  };

  const setZoomLevel = (next: number) => {
    const safeZoom = Math.max(0.75, Math.min(1.5, Number(next.toFixed(2))));
    setZoom(safeZoom);
    zoomScale.value = withTiming(safeZoom, { duration: 140 });
    const { minX, maxX, minY, maxY } = getPanBounds(safeZoom);
    panX.value = withTiming(clamp(panX.value, minX, maxX), { duration: 140 });
    panY.value = withTiming(clamp(panY.value, minY, maxY), { duration: 140 });
  };

  const zoomOut = () => setZoomLevel(zoom - 0.1);
  const zoomIn = () => setZoomLevel(zoom + 0.1);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      panStartX.value = panX.value;
      panStartY.value = panY.value;
    })
    .onUpdate((event) => {
      const scaledWidth = canvasSize.width * zoomScale.value;
      const scaledHeight = canvasSize.height * zoomScale.value;
      const minX =
        scaledWidth <= viewportSize.width
          ? (viewportSize.width - scaledWidth) / 2
          : viewportSize.width - scaledWidth;
      const maxX = scaledWidth <= viewportSize.width ? (viewportSize.width - scaledWidth) / 2 : 0;
      const minY =
        scaledHeight <= viewportSize.height
          ? (viewportSize.height - scaledHeight) / 2
          : viewportSize.height - scaledHeight;
      const maxY =
        scaledHeight <= viewportSize.height ? (viewportSize.height - scaledHeight) / 2 : 0;
      const nextX = panStartX.value + event.translationX;
      const nextY = panStartY.value + event.translationY;
      if (nextX < minX) {
        panX.value = minX + (nextX - minX) * EDGE_RESISTANCE;
      } else if (nextX > maxX) {
        panX.value = maxX + (nextX - maxX) * EDGE_RESISTANCE;
      } else {
        panX.value = nextX;
      }

      if (nextY < minY) {
        panY.value = minY + (nextY - minY) * EDGE_RESISTANCE;
      } else if (nextY > maxY) {
        panY.value = maxY + (nextY - maxY) * EDGE_RESISTANCE;
      } else {
        panY.value = nextY;
      }
    })
    .onEnd(() => {
      const scaledWidth = canvasSize.width * zoomScale.value;
      const scaledHeight = canvasSize.height * zoomScale.value;
      const minX =
        scaledWidth <= viewportSize.width
          ? (viewportSize.width - scaledWidth) / 2
          : viewportSize.width - scaledWidth;
      const maxX = scaledWidth <= viewportSize.width ? (viewportSize.width - scaledWidth) / 2 : 0;
      const minY =
        scaledHeight <= viewportSize.height
          ? (viewportSize.height - scaledHeight) / 2
          : viewportSize.height - scaledHeight;
      const maxY =
        scaledHeight <= viewportSize.height ? (viewportSize.height - scaledHeight) / 2 : 0;

      panX.value = withTiming(Math.min(maxX, Math.max(minX, panX.value)), { duration: 180 });
      panY.value = withTiming(Math.min(maxY, Math.max(minY, panY.value)), { duration: 180 });
    });

  const pinchGesture = Gesture.Pinch()
    .onBegin((event) => {
      if (viewportSize.width <= 0 || viewportSize.height <= 0) return;
      if (!Number.isFinite(event.focalX) || !Number.isFinite(event.focalY)) return;
      pinchStartScale.value = zoomScale.value;
    })
    .onUpdate((event) => {
      if (viewportSize.width <= 0 || viewportSize.height <= 0) return;
      if (!Number.isFinite(event.scale) || !Number.isFinite(event.focalX) || !Number.isFinite(event.focalY)) return;
      const nextScale = Math.max(0.75, Math.min(1.5, pinchStartScale.value * event.scale));
      zoomScale.value = nextScale;
      const scaledWidth = canvasSize.width * nextScale;
      const scaledHeight = canvasSize.height * nextScale;
      const minX =
        scaledWidth <= viewportSize.width
          ? (viewportSize.width - scaledWidth) / 2
          : viewportSize.width - scaledWidth;
      const maxX = scaledWidth <= viewportSize.width ? (viewportSize.width - scaledWidth) / 2 : 0;
      const minY =
        scaledHeight <= viewportSize.height
          ? (viewportSize.height - scaledHeight) / 2
          : viewportSize.height - scaledHeight;
      const maxY =
        scaledHeight <= viewportSize.height ? (viewportSize.height - scaledHeight) / 2 : 0;
      panX.value = Math.min(maxX, Math.max(minX, panX.value));
      panY.value = Math.min(maxY, Math.max(minY, panY.value));
    })
    .onEnd(() => {
      if (!Number.isFinite(zoomScale.value)) return;
      runOnJS(setZoomLevel)(Number(zoomScale.value.toFixed(2)));
    });

  const canvasGesture = Gesture.Simultaneous(panGesture, pinchGesture);
  const animatedCanvasStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: panX.value },
      { translateY: panY.value },
      { scale: zoomScale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        {showBackButton ? (
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={20} color="#f5f5f5" />
            <ThemedText style={styles.backText}>Back</ThemedText>
          </Pressable>
        ) : (
          <View style={styles.backButton} />
        )}
        <ThemedText style={styles.title}>Learning Path</ThemedText>
        <View style={styles.rightSpacer} />
      </View>

      <View style={styles.zoomControls}>
        <Pressable onPress={zoomOut} style={styles.zoomButton}>
          <ThemedText style={styles.zoomButtonText}>-</ThemedText>
        </Pressable>
        <ThemedText style={styles.zoomText}>{Math.round(zoom * 100)}%</ThemedText>
        <Pressable onPress={zoomIn} style={styles.zoomButton}>
          <ThemedText style={styles.zoomButtonText}>+</ThemedText>
        </Pressable>
      </View>

      <ThemedText style={styles.subtitle}>
        Complete each level at 100% to unlock the next chapter.
      </ThemedText>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: warning }]} />
          <ThemedText style={styles.legendText}>In progress</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: accent }]} />
          <ThemedText style={styles.legendText}>Mastered</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <IconSymbol name="lock.fill" size={12} color="#8d8d8d" />
          <ThemedText style={styles.legendText}>Locked</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendDependencyLine} />
          <ThemedText style={styles.legendText}>Dependency</ThemedText>
        </View>
      </View>

      <View
        style={styles.gestureViewport}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setViewportSize({ width, height });
        }}
      >
        <GestureDetector gesture={canvasGesture}>
          <Animated.View style={[styles.canvas, animatedCanvasStyle, { width: canvasSize.width, height: canvasSize.height }]}>
            {nodes.map((node, index) => (
              <PathNode
                key={node.id}
                node={node}
                index={index}
                animationCycle={animationCycle}
                levelColor={getLevelRankColor(node.difficulty)}
                isSuggested={node.id === firstIncompleteUnlockedNode?.id}
                onPress={() => handleNodePress(node)}
              />
            ))}

            {categoryBlockLabels.map((label) => (
              <View
                key={label.id}
                style={[
                  styles.categoryBlockLabelWrap,
                  {
                    left: label.x - 68,
                    top: label.y,
                  },
                ]}
              >
                <ThemedText style={styles.categoryBlockLabelText}>{label.category}</ThemedText>
              </View>
            ))}

            <Svg
              pointerEvents="none"
              style={styles.levelSvgLayer}
              width={canvasSize.width}
              height={canvasSize.height}
            >
              {levelConnections.map((connection) => (
                <Path
                  key={`${connection.from.id}->${connection.to.id}`}
                  d={`M ${connection.from.x} ${connection.from.y + NODE_SIZE / 2 - LEVEL_LINK_OVERLAP} L ${connection.to.x} ${connection.to.y - NODE_SIZE / 2 + LEVEL_LINK_OVERLAP}`}
                  fill="none"
                  stroke={connection.isActive ? getLevelRankColor(connection.from.difficulty) : '#3f3f46'}
                  strokeWidth={connection.isActive ? 2.5 : 2}
                />
              ))}
            </Svg>

            {dependencyConnections.map((connection) => (
              <Svg
                key={`dependency:${connection.from.id}->${connection.to.id}`}
                pointerEvents="none"
                style={styles.dependencySvgLayer}
                width={canvasSize.width}
                height={canvasSize.height}
              >
                <Path
                  d={getCurvedDependencyPath(
                    connection.from.x + NODE_SIZE / 2 - 8,
                    connection.from.y,
                    connection.to.x - NODE_SIZE / 2 + 8,
                    connection.to.y,
                  )}
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                />
              </Svg>
            ))}
          </Animated.View>
        </GestureDetector>
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
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#f5f5f5',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#f5f5f5',
  },
  rightSpacer: {
    width: 84,
    height: 40,
  },
  zoomControls: {
    marginTop: 2,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  zoomButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3f3f46',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#151515',
  },
  zoomButtonText: {
    color: '#e5e7eb',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  zoomText: {
    color: '#9ca3af',
    fontSize: 12,
    fontFamily: 'JetBrainsMono_700Bold',
    width: 44,
    textAlign: 'center',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  legendRow: {
    marginHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  legendText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '700',
  },
  legendDependencyLine: {
    width: 16,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#6b7280',
  },
  gestureViewport: {
    flex: 1,
    overflow: 'hidden',
  },
  canvas: {
    position: 'relative',
  },
  categoryBlockLabelWrap: {
    position: 'absolute',
    minWidth: 136,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: '#151515',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  categoryBlockLabelText: {
    color: '#e5e7eb',
    fontSize: 11,
    fontWeight: '700',
  },
  nodeAbsolute: {
    position: 'absolute',
    width: NODE_SIZE,
    alignItems: 'center',
    zIndex: 2,
  },
  nodePressable: {
    alignItems: 'center',
  },
  nodePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  nodeShell: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
  },
  pulseHalo: {
    position: 'absolute',
    width: NODE_SIZE + 12,
    height: NODE_SIZE + 12,
    borderRadius: 999,
    borderWidth: 2,
  },
  nodeCore: {
    width: NODE_SIZE - 24,
    height: NODE_SIZE - 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2e2e2e',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  nodePercent: {
    fontSize: 12,
    color: '#d1d5db',
    fontFamily: 'JetBrainsMono_700Bold',
  },
  nodePercentLocked: {
    color: '#7d7d7d',
  },
  chapterLabel: {
    marginTop: 1,
    color: '#9ca3af',
    fontSize: 10,
    fontFamily: 'JetBrainsMono_700Bold',
  },
  chapterLabelTop: {
    position: 'absolute',
    top: -18,
    color: '#9ca3af',
    fontSize: 10,
    fontFamily: 'JetBrainsMono_700Bold',
  },
  nodeCompleteGlow: {
    shadowColor: '#f6c453',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  nodeLocked: {
    opacity: 0.72,
  },
  lockBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: '#393939',
  },
  levelSvgLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
  connectorLineDependency: {
    position: 'absolute',
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#6b7280',
    zIndex: 1,
  },
  dependencySvgLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
});
