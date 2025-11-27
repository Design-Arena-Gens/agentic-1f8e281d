import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_DIR = path.join(process.cwd(), 'storage');
const AUDIO_DIR = path.join(BASE_DIR, 'audio');
const VIDEO_DIR = path.join(BASE_DIR, 'video');
const IMAGE_DIR = path.join(BASE_DIR, 'images');

export const ensureStorage = async () => {
  await fs.mkdir(AUDIO_DIR, { recursive: true });
  await fs.mkdir(VIDEO_DIR, { recursive: true });
  await fs.mkdir(IMAGE_DIR, { recursive: true });
};

export const getAudioPath = (filename: string) => path.join(AUDIO_DIR, filename);
export const getVideoPath = (filename: string) => path.join(VIDEO_DIR, filename);
export const getImagePath = (filename: string) => path.join(IMAGE_DIR, filename);

export const fileExists = async (filePath: string) => {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
};

export const removeFileIfExists = async (filePath?: string | null) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    // ignore missing files
  }
};

export const readFileAsBuffer = (filePath: string) => fs.readFile(filePath);
