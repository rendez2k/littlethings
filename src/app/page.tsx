'use client';

import { useEffect, useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { PlaceholderPanel } from '@/components/ui/placeholder-panel';
import { Button } from '@/components/ui/button';

/**
 * Today — the main screen. Phase 1 provides the header, live local date and a
 * friendly empty state. Habit scheduling and completion arrive in Phase 4.
 */
export default function TodayPage() {
  // Format the date on the client so it reflects the user's local calendar.
  const [dateLabel, setDateLabel] = useState('');
  useEffect(() => {
    setDateLabel(
      new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    );
  }, []);

  return (
    <>
      <PageHeader
        title="Today"
        subtitle={dateLabel || ' '}
        action={
          <Button size="sm" aria-label="Add habit" className="h-11 w-11 p-0">
            <Plus aria-hidden="true" className="h-5 w-5" />
          </Button>
        }
      />
      <PlaceholderPanel
        icon={Sparkles}
        title="Nothing planned for today."
        description="Your habits are saved privately on this device. Create your first one to start building better days."
        action={
          <Button>
            <Plus aria-hidden="true" className="h-4 w-4" />
            Create my first habit
          </Button>
        }
      />
    </>
  );
}
