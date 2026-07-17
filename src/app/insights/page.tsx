import type { Metadata } from 'next';
import { BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { PlaceholderPanel } from '@/components/ui/placeholder-panel';

export const metadata: Metadata = { title: 'Insights' };

export default function InsightsPage() {
  return (
    <>
      <PageHeader title="Insights" subtitle="Your progress at a glance" />
      <PlaceholderPanel
        icon={BarChart3}
        title="Insights are on the way"
        description="Once you've tracked a few habits, you'll see completion rates, streaks and gentle trends here — in light and dark mode."
      />
    </>
  );
}
