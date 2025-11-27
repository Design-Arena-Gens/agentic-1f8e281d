import { Dashboard } from '@/components/dashboard';
import { prisma } from '@/lib/prisma';
import type { ConversionItem } from '@/components/conversion-history';

async function getInitialConversions(): Promise<ConversionItem[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const results = await prisma.conversion.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return results.map((item) => ({
    id: item.id,
    title: item.title,
    createdAt: item.createdAt.toISOString(),
    voice: item.voice,
    status: item.status,
    textLength: item.textLength,
    audioUrl: item.audioFilename ? `/api/conversions/${item.id}/audio` : null,
    videoUrl: item.videoFilename ? `/api/conversions/${item.id}/video` : null,
    errorMessage: item.errorMessage
  }));
}

export default async function Page() {
  const initialConversions = await getInitialConversions();
  return <Dashboard initialConversions={initialConversions} />;
}
