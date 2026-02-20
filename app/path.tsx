import { LearningPathScreen } from '@/components/path/learning-path-screen';
import { Stack } from 'expo-router';

export default function LearningPathRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LearningPathScreen showBackButton />
    </>
  );
}
