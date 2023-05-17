import { ExtractedPart, StringPartsExtractionResult, StringPartsExtractor, StringPartsExtractorValidationResult } from '../model';

export interface StringPartsExtractorEditor {
  controlId?: string;
  extractor?: StringPartsExtractor;
  expression?: string;
  expressionError?: string;
  parts: ExtractedPart[];
  validationResult: StringPartsExtractorValidationResult;
  testingString: string;
  extractionResult?: StringPartsExtractionResult;
}

export const getDefaultStringPartsExtractorEditor = (): StringPartsExtractorEditor => ({
  parts: [],
  validationResult: { isValid: true, errors: {} },
  testingString: ''
});
