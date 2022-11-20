import { ValidationResult } from './type';

export function unwrapValidationResult(result: ValidationResult): string[] {
  if (result === true) {
    return [];
  }

  if (result === false) {
    return ['Invalid data'];
  }

  if (!Array.isArray(result)) {
    return [result];
  }

  if (result.length === 0) {
    return [];
  }

  return result;
}
