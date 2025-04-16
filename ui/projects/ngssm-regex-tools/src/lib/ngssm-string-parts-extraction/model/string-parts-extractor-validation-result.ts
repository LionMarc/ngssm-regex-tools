export interface StringPartsExtractorValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export const getExpressionErrors = (result: StringPartsExtractorValidationResult): string[] => result.errors['expression'];
