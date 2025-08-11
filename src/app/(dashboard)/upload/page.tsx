// src/app/(dashboard)/upload/page.tsx

import { UploadView } from '@/modules/upload/ui/views/upload-view';

export default function UploadPage() {
  return <UploadView />;
}

export const metadata = {
  title: 'Upload Center - RetailMind AI',
  description: 'Upload your data files for comprehensive analysis',
};