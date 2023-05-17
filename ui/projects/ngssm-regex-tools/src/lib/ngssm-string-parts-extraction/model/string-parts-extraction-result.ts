export interface StringPartsExtractionResult {
  isValid: boolean;
  expectedPartsCount: number;
  errors: { [key: string]: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extractedParts: { [key: string]: any };
}
