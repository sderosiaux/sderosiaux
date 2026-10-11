import { loadFont as loadInterTight } from '@remotion/google-fonts/InterTight';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';
import type { CSSProperties } from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { THEMES, type Theme, type ThemeName } from './theme';
import { VALUES, type Value } from './values';

const { fontFamily: display } = loadInterTight('normal', { weights: ['800'], subsets: ['latin'] });
const { fontFamily: mono } = loadMono('normal', { weights: ['400', '600'], subsets: ['latin'] });

export const WIDTH = 1200;
export const HEIGHT = 420;
export const FPS = 30;
export const STEP = 72; // frames per value
export const TOTAL = STEP * VALUES.length;
// Start the loop on a settled frame so the GIF's first (static preview) frame is readable.
const OFFSET = 60;

// Wheel geometry: a large dial whose top arc crosses the frame.
const CX = WIDTH / 2;
const CY = 760;
const R_LABEL = 690;
const R_TICK_OUT = 668;
const R_TICK_IN = 656;
const R_TICK_MAJOR_IN = 640;
const R_RING = 632;
const SLOT_DEG = 20; // 18 slots → each value appears 3 times, pattern repeats every 120°
const SLOTS = 360 / SLOT_DEG;

const at = <T,>(xs: readonly T[], i: number): T => xs[((i % xs.length) + xs.length) % xs.length];
const norm = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export type ValuesWheelProps = { readonly theme: ThemeName };

export const ValuesWheel = ({ theme: themeName }: ValuesWheelProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = THEMES[themeName];

  const t = (frame + OFFSET) % TOTAL;
  const step = Math.floor(t / STEP);
  const f = t % STEP;

  const turnAt = (x: number) => spring({ frame: x, fps, config: { damping: 13, stiffness: 170, mass: 0.9 } });
  const turn = turnAt(f);
  const rotation = -(step - 1 + turn) * SLOT_DEG;
  // Angular velocity (deg/frame) drives the motion trail behind the labels.
  const velocity = (turnAt(f) - turnAt(f - 1)) * SLOT_DEG;
  const trail = Math.min(Math.abs(velocity) / 3, 1);

  const current = at(VALUES, step);
  const previous = at(VALUES, step - 1);
  const accent = theme.accents[current.accent];

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <Dial rotation={rotation} theme={theme} accent={accent} f={f} />
      {[3, 2, 1].map((k) => (
        <Labels key={k} rotation={rotation + velocity * k * 0.9} theme={theme} opacity={trail * (0.32 / k)} />
      ))}
      <Labels rotation={rotation} theme={theme} opacity={1} />
      <Ripple f={f} color={accent} />
      <BigWord value={previous} f={f} mode="exit" theme={theme} />
      <BigWord value={current} f={f} mode="enter" theme={theme} />
      <AccentBar f={f} color={accent} />
      <TypedLine text={current.line} f={f} theme={theme} accent={accent} />
    </AbsoluteFill>
  );
};

const Dial = ({ rotation, theme, accent, f }: { rotation: number; theme: Theme; accent: string; f: number }) => {
  const ticks = Array.from({ length: 180 }, (_, i) => i * 2)
    .map((deg) => ({ deg, a: norm(deg + rotation), major: deg % SLOT_DEG === 0 }))
    .filter(({ a }) => Math.abs(a) < 80);

  // Detent "click": the pointer kicks when the wheel lands.
  const kick = interpolate(f, [8, 13, 22], [1, 1.45, 1], { ...clamp, easing: Easing.out(Easing.quad) });

  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: 'absolute', inset: 0 }}>
      <circle cx={CX} cy={CY} r={R_RING} fill="none" stroke={theme.faint} strokeWidth={2} />
      {ticks.map(({ deg, a, major }) => {
        const rad = (a * Math.PI) / 180;
        const rIn = major ? R_TICK_MAJOR_IN : R_TICK_IN;
        return (
          <line
            key={deg}
            x1={CX + rIn * Math.sin(rad)}
            y1={CY - rIn * Math.cos(rad)}
            x2={CX + R_TICK_OUT * Math.sin(rad)}
            y2={CY - R_TICK_OUT * Math.cos(rad)}
            stroke={major ? theme.ink : theme.faint}
            strokeWidth={major ? 3 : 2}
            opacity={interpolate(Math.abs(a), [0, 70, 80], [1, 0.6, 0], clamp)}
          />
        );
      })}
      <g transform={`translate(${CX} ${CY - R_TICK_OUT - 4}) scale(${kick})`}>
        <polygon points="-9,-14 9,-14 0,0" fill={accent} />
      </g>
    </svg>
  );
};

const Labels = ({ rotation, theme, opacity }: { rotation: number; theme: Theme; opacity: number }) => (
  opacity <= 0.01 ? null :
  <>
    {Array.from({ length: SLOTS }, (_, s) => {
      const a = norm(s * SLOT_DEG + rotation);
      if (Math.abs(a) > 72) return null;
      const value = at(VALUES, s);
      const rad = (a * Math.PI) / 180;
      const style: CSSProperties = {
        position: 'absolute',
        left: CX + (R_LABEL + 22) * Math.sin(rad),
        top: CY - (R_LABEL + 22) * Math.cos(rad),
        transform: `translate(-50%, -50%) rotate(${a}deg)`,
        fontFamily: mono,
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: '0.22em',
        whiteSpace: 'nowrap',
        color: interpolateColors(Math.abs(a), [0, 9], [theme.accents[value.accent], theme.muted]),
        opacity: opacity * interpolate(Math.abs(a), [0, 25, 50, 72], [1, 0.8, 0.45, 0], clamp),
      };
      return (
        <div key={s} style={style}>
          {value.word}
        </div>
      );
    })}
  </>
);

const BigWord = ({ value, f, mode, theme }: { value: Value; f: number; mode: 'enter' | 'exit'; theme: Theme }) => {
  const { fps } = useVideoConfig();
  const accent = theme.accents[value.accent];
  const letters = [...value.word];

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 204,
        height: 110,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        fontFamily: display,
        fontWeight: 800,
        fontSize: 96,
        lineHeight: '110px',
        letterSpacing: '-0.02em',
        color: theme.ink,
      }}
    >
      {letters.map((ch, i) => {
        const y =
          mode === 'enter'
            ? interpolate(spring({ frame: f - 8 - i * 1.3, fps, config: { damping: 15, stiffness: 190 } }), [0, 1], [110, 0])
            : interpolate(f - i * 0.35, [0, 6], [0, -110], { ...clamp, easing: Easing.in(Easing.cubic) });
        // Letters land in the accent color, then cool down to ink.
        const color = mode === 'enter' ? interpolateColors(f - i * 1.3, [18, 23], [accent, theme.ink]) : theme.ink;
        return (
          <span key={i} style={{ display: 'inline-block', transform: `translateY(${y}%)`, color }}>
            {ch === ' ' ? ' ' : ch}
          </span>
        );
      })}
    </div>
  );
};

const AccentBar = ({ f, color }: { f: number; color: string }) => {
  const grow = interpolate(f, [14, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.exp) });
  return (
    <div
      style={{
        position: 'absolute',
        left: CX - 60,
        top: 322,
        width: 120,
        height: 6,
        backgroundColor: color,
        transform: `scaleX(${grow})`,
      }}
    />
  );
};

const TypedLine = ({ text, f, theme, accent }: { text: string; f: number; theme: Theme; accent: string }) => {
  const chars = Math.round(interpolate(f, [22, 46], [0, text.length], clamp));
  const cursorOn = f < 46 || Math.floor((f - 46) / 8) % 2 === 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 350,
        textAlign: 'center',
        fontFamily: mono,
        fontWeight: 400,
        fontSize: 26,
        color: theme.ink,
        whiteSpace: 'pre',
      }}
    >
      {text.slice(0, chars)}
      <span style={{ display: 'inline-block', width: 14, height: 28, marginLeft: 4, verticalAlign: '-5px', backgroundColor: cursorOn ? accent : 'transparent' }} />
    </div>
  );
};

// Detent ripple: an accent arc kicks outward from the rim when the wheel lands.
const Ripple = ({ f, color }: { f: number; color: string }) => {
  const p = interpolate(f, [10, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  if (p <= 0 || p >= 1) return null;
  const r = R_TICK_OUT + 6 + p * 46;
  const span = 26; // degrees each side of the pointer
  const pt = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return `${CX + r * Math.sin(rad)} ${CY - r * Math.cos(rad)}`;
  };
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: 'absolute', inset: 0 }}>
      <path
        d={`M ${pt(-span)} A ${r} ${r} 0 0 1 ${pt(span)}`}
        fill="none"
        stroke={color}
        strokeWidth={interpolate(p, [0, 1], [6, 1])}
        opacity={1 - p}
        strokeLinecap="round"
      />
    </svg>
  );
};
