import { z } from "zod";

// Sentiment Analysis Result Schema
export const sentimentResultSchema = z.object({
  success: z.boolean(),
  sentiment_counts: z.object({
    Positive: z.number().optional(),
    Negative: z.number().optional(),
    Neutral: z.number().optional(),
  }),
  sentiment_percentages: z.object({
    Positive: z.number(),
    Negative: z.number(),
    Neutral: z.number(),
  }),
  grouped_reviews: z.object({
    Positive: z.array(z.string()),
    Negative: z.array(z.string()),
    Neutral: z.array(z.string()),
  }),
});

export type SentimentResult = z.infer<typeof sentimentResultSchema>;

// Live Sentiment Analysis Schema
export const liveSentimentSchema = z.object({
  sentiment: z.enum(["positive", "negative", "neutral"]),
});

export type LiveSentiment = z.infer<typeof liveSentimentSchema>;

// File Upload Schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
});

export type FileUpload = z.infer<typeof fileUploadSchema>;

// Live Text Analysis Schema
export const liveTextSchema = z.object({
  text: z.string().min(1, "Please enter some text to analyze"),
});

export type LiveText = z.infer<typeof liveTextSchema>;

// Sentiment type helper
export type SentimentType = "Positive" | "Negative" | "Neutral";
