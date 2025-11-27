export const VOICES = [
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'es-ES', label: 'Español (España)' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' }
];

export const getVoiceLabel = (code: string) => VOICES.find((voice) => voice.code === code)?.label ?? code;
