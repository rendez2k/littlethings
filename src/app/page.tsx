'use client';

import { useAppearance } from '@/components/theme/appearance-provider';
import { GardenToday } from '@/components/garden/screens/today';
import { ClassicToday } from '@/components/classic/screens/today';

export default function TodayPage() {
  const { appearance } = useAppearance();
  return appearance.look === 'classic' ? <ClassicToday /> : <GardenToday />;
}
