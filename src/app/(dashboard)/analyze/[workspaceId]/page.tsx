import { AnalyzeView } from '@/modules/analyze/ui/views/analyze-view';

interface AnalyzePageProps {
  params: {
    workspaceId: string;
  };
}

export default function AnalyzePage({ params }: AnalyzePageProps) {
  return <AnalyzeView workspaceId={params.workspaceId} />;
}

export const metadata = {
  title: 'Analiz Dashboard - RetailMind AI',
  description: 'Comprehensive data analysis and insights',
};