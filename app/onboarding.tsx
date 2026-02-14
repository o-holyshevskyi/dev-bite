import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable, SafeAreaView, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from 'heroui-native';

import useUserStore from '@/store/userStore';

const STACK_OPTIONS = ['React', 'TypeScript', 'Python', 'Go'] as const;
const LEVEL_OPTIONS = ['Junior', 'Mid', 'Senior'] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accent = useThemeColor('accent');

  const setName = useUserStore((state) => state.setName);
  const setTitle = useUserStore((state) => state.setTitle);
  const setAvatarUrl = useUserStore((state) => state.setAvatarUrl);
  const setStack = useUserStore((state) => state.setStack);
  const setDifficulty = useUserStore((state) => state.setDifficulty);
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [name, setNameLocal] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedStack, setSelectedStackLocal] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevelLocal] = useState<string>('');
  const [position, setPosition] = useState('');

  const canGoNext = useMemo(() => {
    if (step === 0) return name.trim().length > 0;
    // Step 1 (avatar) is optional, can always proceed
    if (step === 1) return true;
    if (step === 2) return selectedStack.length > 0;
    if (step === 3) return !!selectedLevel && position.trim().length > 0;
    return false;
  }, [step, name, selectedStack, selectedLevel, position]);

  const handlePickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access your photos is required to pick an avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedAvatar(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (!canGoNext) return;

    if (step === 0) {
      setName(name.trim());
      setStep(1);
      return;
    }

    if (step === 1) {
      if (selectedAvatar) {
        setAvatarUrl(selectedAvatar);
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      setStack(selectedStack);
      setStep(3);
      return;
    }

    if (step === 3) {
      setDifficulty(selectedLevel);
      setTitle(position.trim());
      completeOnboarding();
      router.replace('/(tabs)');
    }
  };

  const toggleStack = (stack: string) => {
    setSelectedStackLocal((prev) => {
      const exists = prev.includes(stack);
      const next = exists ? prev.filter((s) => s !== stack) : [...prev, stack];
      return next;
    });
  };

  const selectLevel = (level: string) => {
    setSelectedLevelLocal(level);
  };

  const buttonLabel = step === 3 ? 'Finish' : 'Next';

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top + 16 }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>DevBite</Text>
          <Text style={styles.subtitle}>Let&apos;s tailor your interview drills.</Text>
        </View>

        <View style={styles.stepIndicator}>
          {[0, 1, 2, 3].map((index) => (
            <View
              key={index}
              style={[
                styles.stepDot,
                index === step && { backgroundColor: accent },
                index < step && { backgroundColor: accent },
              ]}
            />
          ))}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {step === 0 && (
            <View>
              <Text style={styles.stepTitle}>Who&apos;s coding today?</Text>
              <Text style={styles.stepDescription}>
                We&apos;ll use your name across daily challenges and progress.
              </Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setNameLocal}
                  placeholder="e.g. Alex"
                  placeholderTextColor="#7A7A7A"
                  style={styles.textInput}
                  returnKeyType="done"
                />
              </View>
            </View>
          )}

          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>Choose an avatar</Text>
              <Text style={styles.stepDescription}>
                Pick a picture, or skip and we&apos;ll use your initials.
              </Text>
              <View style={styles.avatarRow}>
                <Pressable
                  style={[
                    styles.avatarCircle,
                    selectedAvatar && {
                      borderColor: accent,
                      shadowColor: accent,
                    },
                  ]}
                  onPress={handlePickAvatar}
                >
                  {selectedAvatar ? (
                    <Image source={{ uri: selectedAvatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarPlaceholderText}>Pick from photos</Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>Pick your stack</Text>
              <Text style={styles.stepDescription}>
                Choose everything you want DevBite to focus on.
              </Text>
              <View style={styles.grid}>
                {STACK_OPTIONS.map((stack) => {
                  const isSelected = selectedStack.includes(stack);
                  return (
                    <Pressable
                      key={stack}
                      style={[
                        styles.card,
                        isSelected && {
                          borderColor: accent,
                          backgroundColor: '#1F2933',
                        },
                      ]}
                      onPress={() => toggleStack(stack)}
                    >
                      <Text style={styles.cardTitle}>{stack}</Text>
                      {isSelected && (
                        <Text style={[styles.cardBadge, { backgroundColor: accent }]}>
                          Selected
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={styles.stepTitle}>What&apos;s your level?</Text>
              <Text style={styles.stepDescription}>
                We&apos;ll tune the difficulty and your profile.
              </Text>
              <View style={styles.levelColumn}>
                {LEVEL_OPTIONS.map((level) => {
                  const isSelected = selectedLevel === level;
                  return (
                    <Pressable
                      key={level}
                      style={[
                        styles.levelCard,
                        isSelected && {
                          borderColor: accent,
                          backgroundColor: '#1F2933',
                        },
                      ]}
                      onPress={() => selectLevel(level)}
                    >
                      <Text style={styles.levelTitle}>{level}</Text>
                      <Text style={styles.levelSubtitle}>
                        {level === 'Junior' && 'You are getting comfortable with fundamentals.'}
                        {level === 'Mid' && 'You ship features end‑to‑end and own systems.'}
                        {level === 'Senior' &&
                          'You design systems, mentor others and love tricky edge cases.'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={[styles.inputContainer, { marginTop: 24 }]}>
                <Text style={styles.inputLabel}>Position</Text>
                <TextInput
                  value={position}
                  onChangeText={setPosition}
                  placeholder="e.g. Senior Frontend Engineer"
                  placeholderTextColor="#7A7A7A"
                  style={styles.textInput}
                  returnKeyType="done"
                />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            {step > 0 && (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => setStep((s) => (s - 1) as 0 | 1 | 2 | 3)}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Pressable>
            )}
            {step === 1 && (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  setSelectedAvatar(null);
                  setStep(2);
                }}
              >
                <Text style={styles.secondaryButtonText}>Skip</Text>
              </Pressable>
            )}
            <Pressable
              style={[
                styles.primaryButton,
                { backgroundColor: accent },
                !canGoNext && styles.primaryButtonDisabled,
              ]}
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>{buttonLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#A1A1AA',
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  stepDot: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#27272A',
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#27272A',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#09090B',
  },
  avatarCircleSelected: {
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholderText: {
    color: '#E4E4E7',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 24,
  },
  inputContainer: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#D4D4D8',
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: '#FFFFFF',
    backgroundColor: '#09090B',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  card: {
    flexBasis: '47%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#27272A',
    padding: 16,
    backgroundColor: '#09090B',
    justifyContent: 'space-between',
    minHeight: 96,
  },
  cardSelected: {
    // accent border/background applied dynamically
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    // accent background applied dynamically
    color: '#000000',
    fontSize: 11,
    fontWeight: '600',
  },
  levelColumn: {
    gap: 12,
    marginTop: 8,
  },
  levelCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#27272A',
    padding: 16,
    backgroundColor: '#09090B',
  },
  levelCardSelected: {
    // accent border/background applied dynamically
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  levelSubtitle: {
    fontSize: 13,
    color: '#A1A1AA',
  },
  footer: {
    paddingVertical: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  primaryButton: {
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
    // accent background applied dynamically
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  secondaryButton: {
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E4E4E7',
  },
});

