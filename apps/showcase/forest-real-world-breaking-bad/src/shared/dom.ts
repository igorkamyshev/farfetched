export function extractNumber(e: any) {
  const newValue = e.target.valueAsNumber;

  if (Number.isNaN(newValue)) {
    return 1;
  }

  return newValue;
}
