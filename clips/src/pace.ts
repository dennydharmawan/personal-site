import { useCurrentFrame } from "remotion";

/**
 * Every beat in the clips is authored on a 30fps grid that reads well on paper
 * but plays too fast to follow. Rather than renumber every beat, the whole
 * story clock runs slow and the composition gets proportionally longer.
 */
export const PACE = 1.25;

export const useStoryFrame = () => useCurrentFrame() / PACE;
