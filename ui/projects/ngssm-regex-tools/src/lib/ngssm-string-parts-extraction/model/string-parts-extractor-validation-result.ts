export interface StringPartsExtractorValidationResult {
  isValid: boolean;
  errors: { [key: string]: string[] };
}

export const getExpressionErrors = (result: StringPartsExtractorValidationResult): string[] => result.errors['expression'];
