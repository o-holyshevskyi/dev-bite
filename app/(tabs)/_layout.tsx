import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';

type Tab = {
  id: string;
  title: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'index', title: 'Home', icon: 'house' },
  { id: 'explore', title: 'Explore', icon: 'safari' },
  { id: 'profile', title: 'Profile', icon: 'person.circle' },
] as const;

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <NativeTabs
      backgroundColor={
        Colors[colorScheme ?? 'light'].tint
      }
    >
      {tabs.map((tab) => (
        <NativeTabs.Trigger
          name={tab.id}
          options={{
            title: tab.title,
            backgroundColor: 'transparent',
          }}
          key={tab.id}
        >
          <Label>{tab.title}</Label>
          <Icon sf={{ default: tab.icon as any, selected: tab.icon + '.fill' as any }} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
