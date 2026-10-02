import { useEffect, useState } from 'react';
import type { Easing, TargetAndTransition, Transition } from 'motion/react';

type Cycle = { initial?: TargetAndTransition; animate?: TargetAndTransition; transition?: Transition };

// Without an explicit initial, motion mounts SVG attribute targets like cx/cy as "undefined"
// for one frame before the first keyframe applies.
function firstKeyframe(keyframes: TargetAndTransition): TargetAndTransition {
  return Object.fromEntries(
    Object.entries(keyframes).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
}

export function cycle(
  reduced: boolean,
  keyframes: TargetAndTransition,
  duration: number,
  times: number[],
  options: { delay?: number; ease?: Easing } = {}
): Cycle {
  if (reduced) return {};
  return {
    initial: firstKeyframe(keyframes),
    animate: keyframes,
    transition: {
      delay: options.delay ?? 0,
      duration,
      ease: options.ease ?? 'easeInOut',
      repeat: Number.POSITIVE_INFINITY,
      times
    }
  };
}

type Beat<Name extends string> = { readonly ms: number; readonly name: Name };

// Story loops step through a beat table: one timeout per beat, wrapping to the first beat with
// the next episode. Inactive, it holds the still beat and schedules nothing. A live loop starts on
// the still beat, so going live never jumps away from the frame that was already showing.
export function useEpisode<Name extends string>(
  beats: readonly Beat<Name>[],
  still: NoInfer<Name>,
  active: boolean
): { beat: Name; episode: number } {
  const [step, setStep] = useState(() => ({
    episode: 0,
    index: Math.max(0, beats.findIndex(({ name }) => name === still))
  }));

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => {
      setStep(({ episode, index }) =>
        index + 1 < beats.length ? { episode, index: index + 1 } : { episode: episode + 1, index: 0 }
      );
    }, beats[step.index].ms);
    return () => window.clearTimeout(timer);
  }, [active, beats, step]);

  return active ? { beat: beats[step.index].name, episode: step.episode } : { beat: still, episode: 0 };
}

// A hidden tab pauses Motion's frame loop but not the beat timeouts, so a loop also goes still there.
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(document.visibilityState === 'visible');
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return visible;
}

// Layered depth: offsets and blur double per layer while the alpha climbs one point.
export const liftClassName =
  'shadow-[0_0_0_1px_--alpha(var(--color-zinc-900)/6%),0_1px_3px_--alpha(var(--color-black)/3%),0_4px_8px_-2px_--alpha(var(--color-black)/4%),0_12px_24px_-8px_--alpha(var(--color-black)/6%),0_28px_56px_-20px_--alpha(var(--color-black)/8%)]';

export type Frame = { still: boolean };
