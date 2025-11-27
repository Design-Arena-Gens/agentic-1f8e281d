import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAudioPath, fileExists, readFileAsBuffer } from '@/lib/file-utils';

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: 'Banco de dados não configurado' }, { status: 500 });
  }

  const conversion = await prisma.conversion.findUnique({ where: { id: params.id } });

  if (!conversion || !conversion.audioFilename) {
    return NextResponse.json({ success: false, error: 'Áudio não encontrado' }, { status: 404 });
  }

  const path = getAudioPath(conversion.audioFilename);
  const exists = await fileExists(path);
  if (!exists) {
    return NextResponse.json({ success: false, error: 'Arquivo de áudio indisponível' }, { status: 404 });
  }

  const data = await readFileAsBuffer(path);
  return new NextResponse(data, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename="${conversion.title.replace(/[^a-z0-9\-]/gi, '_')}.mp3"`
    }
  });
}
