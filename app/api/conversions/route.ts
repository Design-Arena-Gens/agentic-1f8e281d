import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: true, data: [] });
  }

  const conversions = await prisma.conversion.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return NextResponse.json({
    success: true,
    data: conversions.map((conversion) => ({
      id: conversion.id,
      title: conversion.title,
      createdAt: conversion.createdAt,
      voice: conversion.voice,
      status: conversion.status,
      textLength: conversion.textLength,
      audioUrl: conversion.audioFilename ? `/api/conversions/${conversion.id}/audio` : null,
      videoUrl: conversion.videoFilename ? `/api/conversions/${conversion.id}/video` : null,
      errorMessage: conversion.errorMessage
    }))
  });
}
