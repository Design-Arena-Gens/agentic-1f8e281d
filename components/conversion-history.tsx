'use client';

import { useMemo } from 'react';
import { getVoiceLabel } from '@/lib/voices';

export interface ConversionItem {
  id: string;
  title: string;
  createdAt: string;
  voice: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  textLength: number;
  audioUrl: string | null;
  videoUrl: string | null;
  errorMessage?: string | null;
}

interface ConversionHistoryProps {
  items: ConversionItem[];
}

const statusLabel: Record<ConversionItem['status'], string> = {
  PENDING: 'Na fila',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluído',
  FAILED: 'Falhou'
};

const statusClassName: Record<ConversionItem['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
  FAILED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
};

export function ConversionHistory({ items }: ConversionHistoryProps) {
  const formattedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt).toLocaleString()
      })),
    [items]
  );

  if (!items.length) {
    return (
      <div className="card text-center text-slate-500 dark:text-slate-400">
        Nenhuma conversão ainda. Gere seu primeiro vídeo agora!
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Histórico recente</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          A cada conversão, seus arquivos ficam disponíveis para download imediato.
        </p>
      </div>

      <div className="space-y-3">
        {formattedItems.map((conversion) => (
          <article
            key={conversion.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/60 p-4 transition hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{conversion.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {conversion.createdAt} · {conversion.textLength.toLocaleString()} caracteres · {getVoiceLabel(conversion.voice)}
                </p>
              </div>
              <span className={`badge ${statusClassName[conversion.status]}`}>{statusLabel[conversion.status]}</span>
            </div>

            {conversion.errorMessage && (
              <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                {conversion.errorMessage}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              {conversion.audioUrl && (
                <a className="button-primary" href={conversion.audioUrl} download>
                  Baixar MP3
                </a>
              )}
              {conversion.videoUrl && (
                <a className="button-primary" href={conversion.videoUrl} download>
                  Baixar MP4
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
