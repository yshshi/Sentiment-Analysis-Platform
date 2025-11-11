import type { SentimentResult } from "@shared/schema";

export interface IStorage {
  saveAnalysisResult(result: SentimentResult): Promise<void>;
  getLatestAnalysisResult(): Promise<SentimentResult | undefined>;
}

export class MemStorage implements IStorage {
  private latestResult: SentimentResult | undefined;

  constructor() {
    this.latestResult = undefined;
  }

  async saveAnalysisResult(result: SentimentResult): Promise<void> {
    this.latestResult = result;
  }

  async getLatestAnalysisResult(): Promise<SentimentResult | undefined> {
    return this.latestResult;
  }
}

export const storage = new MemStorage();
