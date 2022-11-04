export function validateHotkey(hotkey: string) {
  const splitKeys = hotkey.split('+');

  const hasShift = splitKeys.includes('Shift');
  const hasCmd = splitKeys.includes('Cmd') || splitKeys.includes('Ctrl');
  const hasOption = splitKeys.includes('Option') || splitKeys.includes('Alt');

  return (evt: KeyboardEvent) => {
    if (hasShift && !evt.shiftKey) {
      return false;
    }
    if (hasCmd && !evt.metaKey) {
      return false;
    }
    if (hasOption && !evt.altKey) {
      return false;
    }
    return splitKeys.includes(evt.key);
  };
}
