type Min = `${number}min`;
type Sec = `${number}sec`;
type Hour = `${number}h`;

export type Time =
  | `${Hour} ${Min} ${Sec}`
  | `${Hour} ${Min}`
  | `${Min} ${Sec}`
  | `${Hour}`
  | `${Min}`
  | `${Sec}`
  | number;

export function parseTime(time: Time): number {
  if (typeof time === 'number') {
    return time;
  }

  let result = 0;

  for (const part of time.split(' ')) {
    if (part.endsWith('sec')) {
      result += parseInt(part) * 1000;
    }
    if (part.endsWith('min')) {
      result += parseInt(part) * 60000;
    }
    if (part.endsWith('h')) {
      result += parseInt(part) * 3600000;
    }
  }

  return result;
}
