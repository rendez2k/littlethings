import type { Metadata } from 'next';
import { ListTodo, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { PlaceholderPanel } from '@/components/ui/placeholder-panel';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Habits' };

export default function HabitsPage() {
  return (
    <>
      <PageHeader
        title="Habits"
        subtitle="Everything you're building"
        action={
          <Button size="sm" aria-label="Add habit" className="h-11 w-11 p-0">
            <Plus aria-hidden="true" className="h-5 w-5" />
          </Button>
        }
      />
      <PlaceholderPanel
        icon={ListTodo}
        title="No habits yet"
        description="This is where your active and archived habits will live, with search and ordering. Coming together in an upcoming build phase."
      />
    </>
  );
}
