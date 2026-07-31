'use client';

import { useAppearance } from '@/components/theme/appearance-provider';
import { GardenSeeds } from '@/components/garden/screens/goals';
import { ClassicGoals } from '@/components/classic/screens/goals';

export default function GoalsPage() {
  const { appearance } = useAppearance();
  return appearance.look === 'classic' ? <ClassicGoals /> : <GardenSeeds />;
}
