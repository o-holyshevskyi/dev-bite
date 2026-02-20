import { Audio } from 'expo-av';
import useUserStore from '@/store/userStore';

export type SoundType = 'success' | 'error' | 'level_up';

type SoundEntry = {
  sound: Audio.Sound;
};

const sounds = new Map<SoundType, SoundEntry | null>();

/**
 * Asset sources: use require() for bundled files (offline) or { uri } for remote.
 * Replace with local assets by requiring from @/assets/sounds/success.mp3 etc.
 */
const SOUND_SOURCES: Record<SoundType, { uri: string } | number> = {
  success: { uri: 'https://www.orangefreesounds.com/wp-content/uploads/2014/10/Correct-answer.mp3' },
  error: { uri: 'https://www.orangefreesounds.com/wp-content/uploads/2018/06/Wrong-answer-sound-effect.mp3' },
  level_up: { uri: 'https://www.orangefreesounds.com/wp-content/uploads/2017/10/Achievement-sound-effect.mp3' },
};

async function loadSound(type: SoundType): Promise<SoundEntry | null> {
  try {
    const source = SOUND_SOURCES[type];
    const { sound } = await Audio.Sound.createAsync(
      typeof source === 'number' ? source : source,
      { shouldPlay: false },
    );
    return { sound };
  } catch {
    return null;
  }
}

/**
 * Preload all UI sounds. Call once at app startup (e.g. in root layout or after auth).
 */
export async function preloadSounds(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  } catch {
    // Ignore mode errors (e.g. on web)
  }

  const entries = await Promise.all([
    loadSound('success'),
    loadSound('error'),
    loadSound('level_up'),
  ]);
  sounds.set('success', entries[0]);
  sounds.set('error', entries[1]);
  sounds.set('level_up', entries[2]);
}

/**
 * Play a preloaded sound if sounds are enabled in settings.
 * Uses replayAsync() for immediate playback from the start.
 */
export async function playSound(type: SoundType): Promise<void> {
  const soundsEnabled = useUserStore.getState().settings.soundsEnabled;
  if (!soundsEnabled) return;

  const entry = sounds.get(type);
  if (!entry?.sound) return;

  try {
    await entry.sound.replayAsync();
  } catch {
    // Ignore playback errors (e.g. interrupted or not loaded)
  }
}
