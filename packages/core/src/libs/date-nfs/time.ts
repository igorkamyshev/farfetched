type MillisecondUnit = 'ms' | 'milli' | 'millisecond' | 'milliseconds';
type Millisecond = `${number}${MillisecondUnit}`;
const millisecondUnits: MillisecondUnit[] = [
  'ms',
  'milli',
  'millisecond',
  'milliseconds',
];

type SecUnit = 's' | 'sec' | 'secs' | 'second' | 'seconds';
type Sec = `${number}${SecUnit}`;
const secUnits: SecUnit[] = ['s', 'sec', 'secs', 'second', 'seconds'];

type MinUnit = 'm' | 'min' | 'mins' | 'minute' | 'minutes';
type Min = `${number}${MinUnit}`;
const minUnits: MinUnit[] = ['m', 'min', 'mins', 'minute', 'minutes'];

type HourUnit = 'h' | 'hr' | 'hrs' | 'hour' | 'hours';
type Hour = `${number}${HourUnit}`;
const hourUnits: HourUnit[] = ['h', 'hr', 'hrs', 'hour', 'hours'];

export type Time =
  // Without milliseconds
  | `${Hour} ${Min} ${Sec}`
  | `${Hour} ${Min}`
  | `${Min} ${Sec}`
  | `${Hour}`
  | `${Min}`
  | `${Sec}`
  // With milliseconds
  | `${Hour} ${Min} ${Sec} ${Millisecond}`
  | `${Hour} ${Min} ${Millisecond}`
  | `${Min} ${Sec} ${Millisecond}`
  | `${Hour} ${Millisecond}`
  | `${Min} ${Millisecond}`
  | `${Sec} ${Millisecond}`
  | `${Millisecond}`
  // Only milliseconds
  | number;

export function parseTime(time: Time): number {
  if (typeof time === 'number') {
    return time;
  }

  let result = 0;

  for (const part of time.split(' ')) {
    switch (true) {
      case hasEnding(part, millisecondUnits):
        result += parseNumber(part);
        break;
      case hasEnding(part, secUnits):
        result += parseNumber(part) * 1000;
        break;
      case hasEnding(part, minUnits):
        result += parseNumber(part) * 60000;
        break;
      case hasEnding(part, hourUnits):
        result += parseNumber(part) * 3600000;
        break;
    }
  }

  return result;
}

function hasEnding(value: string, allowedEndings: string[]): boolean {
  return allowedEndings.includes(extractNonNumeric(value));
}

function extractNonNumeric(value: string): string {
  return value.replace(/[0-9.]/g, '');
}

function parseNumber(value: string): number {
  return value.includes('.') ? parseFloat(value) : parseInt(value);
}
