import { Buffer } from 'node:buffer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import gTTS from 'node-gtts';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import type { SKRSContext2D } from '@napi-rs/canvas';
import { ensureStorage, getAudioPath, getImagePath, getVideoPath, removeFileIfExists } from './file-utils';

ffmpeg.setFfmpegPath(ffmpegStatic as string);

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

type CanvasModule = typeof import('@napi-rs/canvas');

let canvasModulePromise: Promise<CanvasModule> | null = null;

const loadCanvasModule = async () => {
  if (!canvasModulePromise) {
    canvasModulePromise = import('@napi-rs/canvas');
  }
  return canvasModulePromise;
};

const LANGUAGE_MAP: Record<string, string> = {
  'pt-BR': 'pt-br',
  'en-US': 'en',
  'es-ES': 'es',
  'fr-FR': 'fr',
  'de-DE': 'de'
};

const registerDefaultFonts = async () => {
  const { GlobalFonts } = await loadCanvasModule();
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Inter-Regular.ttf');
  if (GlobalFonts.has('Inter Regular')) {
    return;
  }

  try {
    await fs.access(fontPath);
    GlobalFonts.registerFromPath(fontPath, 'Inter Regular');
  } catch (error) {
    // fallback silently when font file is unavailable
  }
};

const wrapText = (text: string, maxWidth: number, ctx: SKRSContext2D) => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 12);
};

const buildPreviewImage = async (title: string, text: string) => {
  const { createCanvas } = await loadCanvasModule();
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(80, 160, CANVAS_WIDTH - 160, CANVAS_HEIGHT - 320);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 80px "Inter Regular", "Arial", Sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText(title, 140, 220, CANVAS_WIDTH - 280);

  ctx.font = '36px "Inter Regular", "Arial", Sans-serif';
  ctx.fillStyle = '#e2e8f0';
  const lines = wrapText(text, CANVAS_WIDTH - 320, ctx);

  let offsetY = 360;
  const lineHeight = 52;
  for (const line of lines) {
    ctx.fillText(line, 140, offsetY);
    offsetY += lineHeight;
  }

  const filename = `${uuidv4()}.png`;
  const imagePath = getImagePath(filename);
  const buffer = canvas.toBuffer('image/png');
  await fs.writeFile(imagePath, buffer);

  return { filename, path: imagePath };
};

const MAX_TTS_CHUNK_LENGTH = 2000;

const chunkTextForSpeech = (input: string, chunkLength = MAX_TTS_CHUNK_LENGTH) => {
  const normalized = input.replace(/\s+/g, ' ').trim();
  if (normalized.length <= chunkLength) {
    return [normalized];
  }

  const sentences = normalized.split(/(?<=[.!?])\s+/u);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).trim().length <= chunkLength) {
      current = current ? `${current} ${sentence}` : sentence;
    } else {
      if (current) chunks.push(current);
      if (sentence.length > chunkLength) {
        for (let i = 0; i < sentence.length; i += chunkLength) {
          chunks.push(sentence.slice(i, i + chunkLength));
        }
        current = '';
      } else {
        current = sentence;
      }
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
};

export const synthesizeSpeech = async (text: string, voice: string) => {
  await ensureStorage();
  await registerDefaultFonts();

  const language = LANGUAGE_MAP[voice] ?? 'en';
  const tts = gTTS(language);
  const audioFilename = `${uuidv4()}.mp3`;
  const audioPath = getAudioPath(audioFilename);

  await fs.writeFile(audioPath, Buffer.alloc(0));
  const chunks = chunkTextForSpeech(text);

  for (const chunk of chunks) {
    const stream = tts.stream(chunk, { slow: false });
    const buffers: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      stream.on('data', (data: Buffer) => buffers.push(data));
      stream.on('end', () => resolve());
      stream.on('error', (error: unknown) => reject(error));
    });
    await fs.appendFile(audioPath, Buffer.concat(buffers));
  }

  return { audioFilename, audioPath };
};

export const buildVideoFromAudio = async ({
  audioPath,
  title,
  text
}: {
  audioPath: string;
  title: string;
  text: string;
}) => {
  await ensureStorage();
  await registerDefaultFonts();
  const preview = await buildPreviewImage(title, text);

  const videoFilename = `${uuidv4()}.mp4`;
  const videoPath = getVideoPath(videoFilename);

  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .addInput(preview.path)
      .inputOptions(['-loop 1'])
      .addInput(audioPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-shortest',
        '-pix_fmt yuv420p',
        '-movflags +faststart',
        '-tune stillimage'
      ])
      .output(videoPath)
      .on('end', () => resolve())
      .on('error', (error) => reject(error))
      .run();
  });

  await removeFileIfExists(preview.path);

  return { videoFilename, videoPath, previewFilename: preview.filename };
};

export const summarizeText = (text: string, maxLength = 280) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
};
