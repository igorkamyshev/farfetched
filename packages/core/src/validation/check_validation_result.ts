import { ValidationResult } from './type';

export function checkValidationResult(result: ValidationResult): boolean {
  if (result === true) {
    return true;
  }

  if (Array.isArray(result) && result.length === 0) {
    return true;
  }

  if (typeof result === 'string' && result.length === 0) {
    return true;
  }

  return false;
}
