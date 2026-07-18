import type { Metadata } from 'next';
import { SubPage } from '@/components/layout/sub-page';

export const metadata: Metadata = { title: 'Terms' };

export default function TermsPage() {
  return (
    <SubPage title="Terms">
      <p>
        Little Things is provided as-is, to help you build gentle daily habits. It&rsquo;s a
        personal tool, not medical, health or professional advice.
      </p>
      <p>
        Your data is stored on your device and is your responsibility to back up. We can&rsquo;t
        recover data that is lost when a device or browser is reset, so please export a backup
        regularly if your habits matter to you.
      </p>
      <p>
        Please use the app kindly — with yourself most of all. Missing a day is not a failure;
        it&rsquo;s just a day.
      </p>
    </SubPage>
  );
}
