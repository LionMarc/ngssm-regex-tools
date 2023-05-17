import { Injectable } from '@angular/core';
import { Logger } from 'ngssm-store';

import { RegexValidationResult, StringPartsExtractionResult, StringPartsExtractor, StringPartsExtractorValidationResult } from '../model';

interface RegexToolsApi {
  ValidateStringPartsExtractor(expression: string): string;
  GetGroupNames(expression: string): string[];
  ValidateRegex(expression: string): string;
  ExtractParts(extractor: string, input: string): string;
  IsMatch(expression: string, input: string): boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RegexToolsService {
  constructor(private logger: Logger) {}

  public validateStringPartsExtractorExpression(extractorExpression: string): StringPartsExtractorValidationResult {
    const validationResult: string | undefined = this.getRegexToolsApi()?.ValidateStringPartsExtractor(
      JSON.stringify({ expression: extractorExpression, parts: [] })
    );

    if (!validationResult) {
      return { isValid: false, errors: {} };
    }

    const result: StringPartsExtractorValidationResult = JSON.parse(validationResult);
    if (result.isValid || !result.errors['expression']) {
      return { isValid: true, errors: {} };
    }

    return result;
  }

  public validateStringPartsExtractor(extractor: StringPartsExtractor): StringPartsExtractorValidationResult {
    const serializedExtractor = JSON.stringify(extractor);
    const validationResult = this.getRegexToolsApi()?.ValidateStringPartsExtractor(serializedExtractor);
    if (!validationResult) {
      return { isValid: false, errors: {} };
    }

    const result: StringPartsExtractorValidationResult = JSON.parse(validationResult);
    return result;
  }

  public getGroupNames(extractorExpression: string): string[] {
    const result = this.getRegexToolsApi()?.GetGroupNames(extractorExpression) ?? [];
    this.logger.information(`Getting group names from '${extractorExpression}': ${result.join(',')}`);
    return result;
  }

  public validateRegex(expression: string): RegexValidationResult {
    const result = this.getRegexToolsApi()?.ValidateRegex(expression);
    if (!result) {
      return {
        isValid: false
      };
    }

    return JSON.parse(result);
  }

  public isMatch(expression: string, input: string): boolean {
    return this.getRegexToolsApi()?.IsMatch(expression, input) ?? false;
  }

  public extractParts(extractor: StringPartsExtractor, input: string): StringPartsExtractionResult {
    const result = this.getRegexToolsApi()?.ExtractParts(JSON.stringify(extractor), input);
    this.logger.information(`Extracting parts from '${input}' with '${extractor}': ${result}`);
    if (!result) {
      return {
        isValid: false,
        expectedPartsCount: extractor.parts.length,
        errors: {},
        extractedParts: {}
      };
    }

    return JSON.parse(result);
  }

  private getRegexToolsApi(): RegexToolsApi | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any)?.dotnet?.smusdi?.RegexToolsApi;
  }
}
