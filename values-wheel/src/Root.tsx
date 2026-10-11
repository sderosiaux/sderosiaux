import { Composition } from 'remotion';
import { FPS, HEIGHT, TOTAL, ValuesWheel, WIDTH, type ValuesWheelProps } from './ValuesWheel';

export const RemotionRoot = () => (
  <>
    <Composition
      id="ValuesWheelLight"
      component={ValuesWheel}
      durationInFrames={TOTAL}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ theme: 'light' } satisfies ValuesWheelProps}
    />
    <Composition
      id="ValuesWheelDark"
      component={ValuesWheel}
      durationInFrames={TOTAL}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ theme: 'dark' } satisfies ValuesWheelProps}
    />
  </>
);
