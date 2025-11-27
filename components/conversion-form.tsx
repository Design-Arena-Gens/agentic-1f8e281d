'use client';

import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { VOICES } from '@/lib/voices';

interface ConversionResult {
  id: string;
  title: string;
  createdAt: string;
  voice: string;
  textLength: number;
  audioUrl: string;
  videoUrl: string;
}

interface ConversionFormProps {
  onConversionCompleted: (conversion: ConversionResult) => void;
}

const MAX_CHARS = 200_000;

export function ConversionForm({ onConversionCompleted }: ConversionFormProps) {
  const [title, setTitle] = useState('Roteiro Incrível');
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('pt-BR');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const progress = useMemo(() => Math.min((text.length / MAX_CHARS) * 100, 100), [text.length]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!text.trim()) {
      setError('Informe o texto que deseja converter.');
      return;
    }

    if (text.length > MAX_CHARS) {
      setError('O texto ultrapassa o limite de 200.000 caracteres.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, text, voice })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Falha ao processar a conversão.');
      }

      setResult(payload.data);
      onConversionCompleted(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? []);
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 2MB.');
      return;
    }

    const content = await file.text();
    const truncated = content.slice(0, MAX_CHARS);
    setText(truncated);
  };

  return (
    <form className="card space-y-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Texto para Vídeo</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Escreva ou importe um roteiro e converta em áudio MP3 e vídeo MP4 em minutos.
          </p>
        </div>
        <div className="text-right">
          <span className="badge">{text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}</span>
          <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Título do projeto</span>
          <input
            className="input-field"
            placeholder="Nome do seu vídeo"
            value={title}
            maxLength={120}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Voz</span>
          <select className="input-field" value={voice} onChange={(event) => setVoice(event.target.value)}>
            {VOICES.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Texto</span>
        <textarea
          className="input-field h-72 resize-y"
          placeholder="Cole seu roteiro aqui..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={MAX_CHARS}
        />
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 transition hover:border-blue-500 dark:border-slate-700">
            <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
            <span>Importar arquivo .txt</span>
          </label>
          <span>Limite: 200 mil caracteres · MP4 compatível com qualquer player</span>
        </div>
      </label>

      {error && <p className="rounded-lg bg-red-100 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-200">{error}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="button-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Renderizando...' : 'Converter agora'}
        </button>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Processamento otimizado com FFmpeg · Tempo estimado &lt; 5 minutos para 200k caracteres
        </span>
      </div>

      {result && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pronto! Seu conteúdo foi gerado.</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Prévia do áudio</p>
              <audio className="w-full" controls src={result.audioUrl} />
              <a className="button-primary w-full text-center" href={result.audioUrl} download>
                Baixar MP3
              </a>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Prévia do vídeo</p>
              <video className="w-full rounded-lg" controls src={result.videoUrl} />
              <a className="button-primary w-full text-center" href={result.videoUrl} download>
                Baixar MP4
              </a>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
