import fs from "fs/promises"; // use promises version
import fsSync from "fs"; // for createReadStream
import path from "path";
import csvParser from "csv-parser";
import * as XLSX from "xlsx";
import { analyzeLiveSentiment } from "./gemini";
import type { SentimentResult } from "../shared/schema";

type FileType = "csv" | "xlsx" | "xls" | "pdf";

function formatSentimentPercentages(percentages: Record<string, number>): SentimentResult["sentiment_percentages"] {
  return {
    Positive: percentages["Positive"] ?? 0,
    Negative: percentages["Negative"] ?? 0,
    Neutral: percentages["Neutral"] ?? 0,
  };
}

function formatGroupedReviews(grouped: Record<string, string[]>): SentimentResult["grouped_reviews"] {
  return {
    Positive: grouped["Positive"] ?? [],
    Negative: grouped["Negative"] ?? [],
    Neutral: grouped["Neutral"] ?? [],
  };
}

function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\d/g, "")
    .split(" ")
    .filter((w) => w.length > 1)
    .join(" ");
}

async function analyzeTextArray(texts: string[]): Promise<SentimentResult> {
  const groupedReviews: Record<string, string[]> = {
    Positive: [],
    Negative: [],
    Neutral: [],
  };

  for (const t of texts) {
    const sentiment = await analyzeLiveSentiment(cleanText(t));
    const key =
      sentiment.toLowerCase() === "positive"
        ? "Positive"
        : sentiment.toLowerCase() === "negative"
        ? "Negative"
        : "Neutral";
    groupedReviews[key].push(t);
  }

  const sentimentCounts = {
    Positive: groupedReviews.Positive.length,
    Negative: groupedReviews.Negative.length,
    Neutral: groupedReviews.Neutral.length,
  };

  const total = Object.values(sentimentCounts).reduce((a, b) => a + b, 0) || 1;

  const sentimentPercentages = formatSentimentPercentages({
    Positive: Math.round((sentimentCounts.Positive / total) * 100),
    Negative: Math.round((sentimentCounts.Negative / total) * 100),
    Neutral: Math.round((sentimentCounts.Neutral / total) * 100),
  });

  return {
    success: true,
    sentiment_counts: sentimentCounts,
    sentiment_percentages: sentimentPercentages,
    grouped_reviews: formatGroupedReviews(groupedReviews),
  };
}

async function parseCSV(filePath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const results: string[] = [];
    fsSync.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data) => {
        if (data.reviewText) results.push(data.reviewText);
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

async function parseExcel(filePath: string): Promise<string[]> {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as any[];
  return json.map((row) => row.reviewText).filter((r) => r);
}

export async function analyzeFileSentiment(
  filePath: string,
  fileType: FileType
): Promise<SentimentResult> {
  try {
    let texts: string[] = [];

    if (fileType === "csv") texts = await parseCSV(filePath);
    else if (fileType === "xlsx" || fileType === "xls") texts = await parseExcel(filePath);
    else
      return {
        success: false,
        sentiment_counts: { Positive: 0, Negative: 0, Neutral: 0 },
        sentiment_percentages: { Positive: 0, Negative: 0, Neutral: 0 },
        grouped_reviews: { Positive: [], Negative: [], Neutral: [] }
      };

    if (texts.length === 0)
      return {
        success: false,
        sentiment_counts: { Positive: 0, Negative: 0, Neutral: 0 },
        sentiment_percentages: { Positive: 0, Negative: 0, Neutral: 0 },
        grouped_reviews: { Positive: [], Negative: [], Neutral: [] }
      };

    return await analyzeTextArray(texts);
  } catch (error: any) {
    return {
      success: false,
      sentiment_counts: { Positive: 0, Negative: 0, Neutral: 0 },
      sentiment_percentages: { Positive: 0, Negative: 0, Neutral: 0 },
      grouped_reviews: { Positive: [], Negative: [], Neutral: [] }
    };
  } finally {
    // Use promises version to avoid callback/catch errors
    try {
      await fs.unlink(filePath);
    } catch {}
  }
}
