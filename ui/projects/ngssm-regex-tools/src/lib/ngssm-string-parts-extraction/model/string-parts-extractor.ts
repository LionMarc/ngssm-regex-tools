import { ExtractedPart } from './extracted-part';

export interface StringPartsExtractor {
  expression: string;
  parts: ExtractedPart[];
}
