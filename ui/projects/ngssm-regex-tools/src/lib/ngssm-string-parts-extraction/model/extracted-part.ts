import { ExtractedPartType } from './extracted-part-type';

export interface ExtractedPart {
  type: ExtractedPartType;
  name: string;
  format: string | null;
}
