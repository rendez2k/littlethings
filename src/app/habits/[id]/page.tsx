'use client';

import { useAppearance } from '@/components/theme/appearance-provider';
import { GardenPlantDetail } from '@/components/garden/screens/habit-detail';
import { ClassicHabitDetail } from '@/components/classic/screens/habit-detail';

export default function HabitDetailPage() {
  const { appearance } = useAppearance();
  return appearance.look === 'classic' ? <ClassicHabitDetail /> : <GardenPlantDetail />;
}
