/**
 * Shared frame grid, at 30fps. Every clip enters and leaves on the same beats so
 * the four read as a set; the three acts in between are each clip's own.
 */
export const timing = {
  cardIn: [0, 16],
  actOne: [18, 136],
  actTwo: [136, 254],
  actThree: [254, 356],
  cardOut: [332, 356],
} as const;
