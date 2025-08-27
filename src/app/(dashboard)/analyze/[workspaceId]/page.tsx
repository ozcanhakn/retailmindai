import { AnalyzeView } from '@/modules/analyze/ui/views/analyze-view';

interface AnalyzePageParams {
  workspaceId: string;
}

export default async function AnalyzePage({ params }: { params: Promise<AnalyzePageParams> }) {
  const { workspaceId } = await params;
  return <AnalyzeView workspaceId={workspaceId} />;
}

export const metadata = {
  title: 'Analiz Dashboard - RetailMind AI',
  description: 'Comprehensive data analysis and insights',
};