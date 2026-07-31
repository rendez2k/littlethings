'use client';

import { useAppearance } from '@/components/theme/appearance-provider';
import { GardenPlants } from '@/components/garden/screens/habits';
import { ClassicHabits } from '@/components/classic/screens/habits';

export default function HabitsPage() {
  const { appearance } = useAppearance();
  return appearance.look === 'classic' ? <ClassicHabits /> : <GardenPlants />;
}
