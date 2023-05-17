export enum ExtractedPartType {
  text = 'Text',
  date = 'Date',
  time = 'Time',
  number = 'Number'
}

export const getExtractedPartTypes = (): ExtractedPartType[] => [
  ExtractedPartType.text,
  ExtractedPartType.date,
  ExtractedPartType.time,
  ExtractedPartType.number
];
