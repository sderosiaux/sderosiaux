import type { AccentKey } from './values';

export type Theme = {
  readonly bg: string;
  readonly ink: string;
  readonly muted: string;
  readonly faint: string;
  readonly accents: Readonly<Record<AccentKey, string>>;
};

// GIF output: flat colors only, no gradients (palette quantization bands them).
export const THEMES = {
  light: {
    bg: '#FFFFFF', // GitHub light canvas: the GIF must blend into the README
    ink: '#111111',
    muted: '#8A8A85',
    faint: '#D9D9D3',
    accents: {
      ember: '#FF4D2E',
      amber: '#F2A900',
      blue: '#2E6BFF',
      violet: '#8B5CF6',
      green: '#00A36C',
      pink: '#F0368F',
    },
  },
  dark: {
    bg: '#0D1117', // GitHub dark canvas
    ink: '#F4F4F0',
    muted: '#7C7C78',
    faint: '#30363D',
    accents: {
      ember: '#FF6A4D',
      amber: '#FFC233',
      blue: '#5C8CFF',
      violet: '#A685FF',
      green: '#2BD48F',
      pink: '#FF5CAA',
    },
  },
} as const satisfies Record<string, Theme>;

export type ThemeName = keyof typeof THEMES;
