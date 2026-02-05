import DailyChallengeCard from '@/components/tabs/index/daily-challenge-card';
import Header from '@/components/tabs/index/header';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-background">
      <Header />
      <DailyChallengeCard />
    </SafeAreaView>
  );
}
