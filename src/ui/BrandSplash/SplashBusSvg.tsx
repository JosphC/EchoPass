import { useId } from 'react';
import Animated, { Easing, cancelAnimation, useAnimatedProps, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { Circle, ClipPath, Defs, G, LinearGradient, Mask, Path, Rect, Stop, Svg, Line } from 'react-native-svg';
import { SPLASH_MS, WAVE_L, innerOpacity, waveOffset } from './cycle';

export const SPLASH_BG = '#FFFFFF';

const PULSE_D = 'M32 140L74 140L88 113L104 151L120 87L136 156L151 117L164 140L208 140';
const GAP_D = 'M28 149L74 149L88 122L104 160L120 96L136 165L151 126L164 149L212 149';
const INNER_D = 'M74 149L88 122L104 160L120 96L136 165L151 126L164 149Z';
const SHIELD_D = 'M48 68Q48 56 60 56L180 56Q192 56 192 68L192 154L48 154Z';
const OUTER_D =
  'M68 20C100 15 140 15 172 20C194 24 203 38 205 60L210 192C210 207 200 216 185 216L183 216L183 233' +
  'C183 240 178 244 170 244L161 244C153 244 148 240 148 233L148 216L92 216L92 233C92 240 87 244 79 244' +
  'L70 244C62 244 57 240 57 233L57 216L55 216C40 216 30 207 30 192L35 60C37 38 46 24 68 20Z';

const APath = Animated.createAnimatedComponent(Path);

export function playSplashLoop(cyc: SharedValue<number>): void {
  cyc.value = withRepeat(
    withSequence(
      withTiming(1, { duration: SPLASH_MS, easing: Easing.linear }),
      withTiming(0, { duration: 0 }),
    ),
    -1,
    false,
  );
}

export function playSplashOnce(cyc: SharedValue<number>): void {
  cyc.value = withTiming(1, { duration: SPLASH_MS, easing: Easing.linear });
}

export function stopSplashLoop(cyc: SharedValue<number>): void {
  cancelAnimation(cyc);
  cyc.value = 0;
}

interface SplashBusSvgProps {
  cyc: SharedValue<number>;
  size?: number;
  testID?: string;
}

/** Pictograma autobuz 1:1 din varianta web (masca + unda cu reveal pe dash). */
export function SplashBusSvg({ cyc, size = 210, testID }: SplashBusSvgProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `busGradient${uid}`;
  const maskId = `busCutoutMask${uid}`;
  const clipId = `busOuterContour${uid}`;

  const waveProps = useAnimatedProps(() => ({ strokeDashoffset: waveOffset(cyc.value) }));
  const innerProps = useAnimatedProps(() => ({ opacity: innerOpacity(cyc.value) }));

  return (
    <Svg height={(size * 260) / 240} viewBox="0 0 240 260" width={size} testID={testID}>
      <Defs>
        <LinearGradient id={gradId} x1="30" y1="20" x2="205" y2="235" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#1d56d8" />
          <Stop offset="48%" stopColor="#1982b8" />
          <Stop offset="100%" stopColor="#14b092" />
        </LinearGradient>
        <Mask id={maskId}>
          <Rect x={0} y={0} width={240} height={260} fill="white" />
          <Rect x={78} y={34} width={84} height={11} rx={5.5} fill="black" />
          <Path d={SHIELD_D} fill="black" />
          <APath
            animatedProps={waveProps}
            d={GAP_D}
            fill="none"
            stroke="black"
            strokeWidth={21}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={[WAVE_L]}
            strokeDashoffset={0}
          />
          <APath animatedProps={innerProps} d={INNER_D} fill="black" opacity={1} />
          <Line x1={25} y1={149} x2={215} y2={149} stroke="black" strokeWidth={10} />
          <Circle cx={66} cy={184} r={12.5} fill="black" />
          <Circle cx={174} cy={184} r={12.5} fill="black" />
        </Mask>
        <ClipPath id={clipId}>
          <Path d={OUTER_D} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${clipId})`}>
        <Rect x={0} y={0} width={240} height={260} fill={`url(#${gradId})`} mask={`url(#${maskId})`} testID="splash-bus-body" />
        <APath
          animatedProps={waveProps}
          d={PULSE_D}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={10.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={[WAVE_L]}
          strokeDashoffset={0}
          testID="splash-pulse"
        />
      </G>
    </Svg>
  );
}
