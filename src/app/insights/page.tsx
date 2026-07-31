'use client';

import { useAppearance } from '@/components/theme/appearance-provider';
import { GardenSeason } from '@/components/garden/screens/insights';
import { ClassicInsights } from '@/components/classic/screens/insights';

export default function InsightsPage() {
  const { appearance } = useAppearance();
  return appearance.look === 'classic' ? <ClassicInsights /> : <GardenSeason />;
}
