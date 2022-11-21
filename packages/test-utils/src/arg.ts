export function firstArg(listener: any, callNumber: number): any {
  return listener.mock.calls[callNumber][0];
}
