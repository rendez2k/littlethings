import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { ThemeScript } from '@/components/theme/theme-script';
import { AppearanceProvider } from '@/components/theme/appearance-provider';
import { AppShell } from '@/components/layout/app-shell';
import { ServiceWorkerRegistrar } from '@/components/pwa/service-worker-registrar';

const APP_NAME = 'Little Things';
const APP_DESCRIPTION =
  'A calm, private habit tracker. Build better days — no account required, works offline.';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: `${APP_NAME} — Build better days`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f4f1' },
    { media: '(prefers-color-scheme: dark)', color: '#14161c' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" data-palette="lavender" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <AppearanceProvider>
          <AppShell>{children}</AppShell>
        </AppearanceProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
