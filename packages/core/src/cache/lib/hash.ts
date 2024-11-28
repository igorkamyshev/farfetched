export function hashCode(s: string) {
  let h = 0;
  let i = 0;
  while (i < s.length) h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
  return h.toString(36);
}
