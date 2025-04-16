export interface StringPartsExtractionResult {
  isValid: boolean;
  expectedPartsCount: number;
  errors: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extractedParts: Record<string, any>;
}
