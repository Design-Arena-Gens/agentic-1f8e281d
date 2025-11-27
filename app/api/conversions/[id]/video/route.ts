import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getVideoPath, fileExists, readFileAsBuffer } from '@/lib/file-utils';

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: 'Banco de dados não configurado' }, { status: 500 });
  }

  const conversion = await prisma.conversion.findUnique({ where: { id: params.id } });

  if (!conversion || !conversion.videoFilename) {
    return NextResponse.json({ success: false, error: 'Vídeo não encontrado' }, { status: 404 });
  }

  const path = getVideoPath(conversion.videoFilename);
  const exists = await fileExists(path);
  if (!exists) {
    return NextResponse.json({ success: false, error: 'Arquivo de vídeo indisponível' }, { status: 404 });
  }

  const data = await readFileAsBuffer(path);
  return new NextResponse(data, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="${conversion.title.replace(/[^a-z0-9\-]/gi, '_')}.mp4"`
    }
  });
}
