import type { Metadata } from 'next';
import { CloudOff } from 'lucide-react';
import { PlaceholderPanel } from '@/components/ui/placeholder-panel';

export const metadata: Metadata = { title: 'Offline' };

/**
 * Served by the service worker when a navigation request cannot be fulfilled
 * from the cache while offline. The rest of the app remains usable.
 */
export default function OfflinePage() {
  return (
    <div className="pt-16">
      <PlaceholderPanel
        icon={CloudOff}
        title="You're offline"
        description="This page hasn't been saved for offline use yet. Your habits are safe on this device — head back to Today to keep tracking."
      />
    </div>
  );
}
