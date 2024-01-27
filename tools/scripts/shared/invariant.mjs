export function invariant(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}
