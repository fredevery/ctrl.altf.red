export const mapRange = (
  value: number,
  start1: number,
  stop1: number,
  start2: number,
  stop2: number
) => {
  const newVal =
    start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  if (start2 < stop2) {
    return constrain(newVal, start2, stop2);
  } else {
    return constrain(newVal, stop2, start2);
  }
};

const constrain = (n: number, low: number, high: number) => {
  return Math.max(Math.min(n, high), low);
};
