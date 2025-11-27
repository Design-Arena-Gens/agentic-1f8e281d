'use client';

import { useState } from 'react';
import { ConversionForm } from './conversion-form';
import { ConversionHistory, ConversionItem } from './conversion-history';
import { ThemeToggle } from './theme-toggle';

interface DashboardProps {
  initialConversions: ConversionItem[];
}

export function Dashboard({ initialConversions }: DashboardProps) {
  const [conversions, setConversions] = useState<ConversionItem[]>(initialConversions);

  const handleConversionCompleted = (conversion: {
    id: string;
    title: string;
    createdAt: string;
    voice: string;
    textLength: number;
    audioUrl: string;
    videoUrl: string;
  }) => {
    setConversions((prev) => [
      {
        id: conversion.id,
        title: conversion.title,
        createdAt: conversion.createdAt,
        voice: conversion.voice,
        status: 'COMPLETED',
        textLength: conversion.textLength,
        audioUrl: conversion.audioUrl,
        videoUrl: conversion.videoUrl
      },
      ...prev.filter((item) => item.id !== conversion.id)
    ]);
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 md:px-8">
      <header className="card flex flex-col gap-6 bg-gradient-to-br from-brand-secondary/90 via-slate-900 to-blue-800 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">TextToVideo Converter Pro</h1>
            <p className="mt-2 max-w-2xl text-base text-slate-200">
              Converta roteiros extensos em vídeos MP4 compatíveis com qualquer PC. Pipeline otimizado usa IA para voz
              natural e FFmpeg para renderização acelerada.&nbsp;
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-medium text-slate-100">
              Até 200.000 caracteres · Exporta MP3 + MP4 · Renderização &lt; 5 min
            </div>
            <ThemeToggle />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-black/20 p-4">
            <p className="text-sm uppercase text-slate-300">Fluxo Inteligente</p>
            <p className="text-lg font-semibold">Pipeline IA + FFmpeg</p>
          </div>
          <div className="rounded-xl bg-black/20 p-4">
            <p className="text-sm uppercase text-slate-300">Qualidade</p>
            <p className="text-lg font-semibold">Áudio e vídeo otimizado</p>
          </div>
          <div className="rounded-xl bg-black/20 p-4">
            <p className="text-sm uppercase text-slate-300">Produtividade</p>
            <p className="text-lg font-semibold">Interface colaborativa</p>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ConversionForm onConversionCompleted={handleConversionCompleted} />
        <ConversionHistory items={conversions} />
      </div>
    </main>
  );
}
