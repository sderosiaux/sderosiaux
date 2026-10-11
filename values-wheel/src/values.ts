export type Value = {
  readonly word: string;
  readonly line: string;
  readonly accent: AccentKey;
};

export type AccentKey = 'ember' | 'amber' | 'blue' | 'violet' | 'green' | 'pink';

export const VALUES: readonly Value[] = [
  { word: 'END TO END', line: 'I take ideas all the way to prod.', accent: 'ember' },
  { word: 'SPEED', line: 'Fast if I can undo it. Careful if not.', accent: 'amber' },
  { word: 'SHOW IT', line: "I'd rather demo than pitch.", accent: 'blue' },
  { word: 'LIMITS', line: 'Push the tools. Admit my limits.', accent: 'violet' },
  { word: 'JUDGMENT', line: 'AI does the work. I make the call.', accent: 'green' },
  { word: 'SHARE', line: 'I share everything I learn.', accent: 'pink' },
];
