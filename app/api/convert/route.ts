import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { buildVideoFromAudio, summarizeText, synthesizeSpeech } from '@/lib/conversion-service';
import { getAudioPath, getVideoPath, removeFileIfExists } from '@/lib/file-utils';

const convertSchema = z.object({
  text: z.string().min(1).max(200_000),
  voice: z.string().default('pt-BR'),
  title: z.string().trim().min(1).max(120).default('Projeto TextToVideo')
});

export async function POST(request: Request) {
  const json = await request.json();
  const parse = convertSchema.safeParse(json);

  if (!parse.success) {
    return NextResponse.json(
      { success: false, error: 'Entrada inválida', issues: parse.error.flatten() },
      { status: 400 }
    );
  }

  const { text, voice, title } = parse.data;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        success: false,
        error: 'Configure a variável de ambiente DATABASE_URL para habilitar o processamento.'
      },
      { status: 500 }
    );
  }

  const conversion = await prisma.conversion.create({
    data: {
      title,
      textLength: text.length,
      voice,
      status: 'PENDING'
    }
  });

  let audioFilename: string | null = null;
  let audioPath: string | null = null;
  let videoFilename: string | null = null;

  try {
    await prisma.conversion.update({
      where: { id: conversion.id },
      data: { status: 'PROCESSING' }
    });

    const audio = await synthesizeSpeech(text, voice);
    audioFilename = audio.audioFilename;
    audioPath = audio.audioPath;

    const video = await buildVideoFromAudio({ audioPath: audio.audioPath, title, text: summarizeText(text, 1024) });
    videoFilename = video.videoFilename;

    const updated = await prisma.conversion.update({
      where: { id: conversion.id },
      data: {
        status: 'COMPLETED',
        audioFilename,
        videoFilename
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        title: updated.title,
        createdAt: updated.createdAt,
        voice: updated.voice,
        textLength: updated.textLength,
        audioUrl: `/api/conversions/${updated.id}/audio`,
        videoUrl: `/api/conversions/${updated.id}/video`
      }
    });
  } catch (error) {
    if (audioFilename) {
      await removeFileIfExists(getAudioPath(audioFilename));
    }
    if (videoFilename) {
      await removeFileIfExists(getVideoPath(videoFilename));
    }

    await prisma.conversion.update({
      where: { id: conversion.id },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Falha ao processar a conversão'
      },
      { status: 500 }
    );
  }
}
