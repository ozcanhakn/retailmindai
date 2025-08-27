'use client';

import { ThemeSettings } from '@/modules/settings/ui/components/theme-settings';

export default function SettingsPage() {
  return (
    <div className="p-6" style={{ backgroundColor: 'var(--bg-100)', color: 'var(--text-100)', minHeight: '100vh' }}>
      <ThemeSettings />
    </div>
  );
}