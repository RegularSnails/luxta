export function average(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error("empty");
  }
  const s = arr.reduce((a, b) => a + b, 0);
  return s / arr.length;
}
