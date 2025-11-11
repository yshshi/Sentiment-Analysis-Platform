import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import { storage } from "./storage";
import { analyzeLiveSentiment } from "./gemini";

const execAsync = promisify(exec);

const pythonCmd = process.platform === "win32" ? "python" : "python3";

const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
      );
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/analyze", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = req.file.path;
      const fileExtension = path
        .extname(req.file.originalname)
        .toLowerCase()
        .substring(1);

      const pythonScript = path.join(
        process.cwd(),
        "server",
        "python",
        "sentiment_analyzer.py",
      );

      try {
        const { stdout, stderr } = await execAsync(
  `${pythonCmd} "${pythonScript}" "${filePath}" "${fileExtension}"`
);

        if (stderr && !stderr.includes("[nltk_data]")) {
          console.error("Python stderr:", stderr);
        }

        const result = JSON.parse(stdout);

        await fs.unlink(filePath);

        if (result.error) {
          return res.status(400).json(result);
        }

        await storage.saveAnalysisResult(result);
        res.json(result);
      } catch (error: any) {
        await fs.unlink(filePath);

        if (error.stdout) {
          try {
            const errorResult = JSON.parse(error.stdout);
            return res.status(400).json(errorResult);
          } catch {}
        }

        throw error;
      }
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to analyze file",
      });
    }
  });

  app.post("/api/live-text", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({ error: "Text is required" });
      }

      const sentiment = await analyzeLiveSentiment(text.trim());

      res.json({ sentiment });
    } catch (error) {
      console.error("Live text analysis error:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to analyze text",
      });
    }
  });

  app.post("/api/live-audio", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file uploaded" });
      }

      const audioPath = req.file.path;

      try {
        const pythonScript = path.join(
          process.cwd(),
          "server",
          "python",
          "audio_transcriber.py",
        );
        const { stdout, stderr } = await execAsync(
          `${pythonCmd} "${pythonScript}" "${audioPath}"`,
        );

        if (stderr && !stderr.includes("ALSA")) {
          console.error("Audio transcription stderr:", stderr);
        }

        const transcriptionResult = JSON.parse(stdout);

        await fs.unlink(audioPath);

        if (transcriptionResult.error) {
          return res.status(400).json(transcriptionResult);
        }

        const transcribedText = transcriptionResult.text;
        const sentiment = await analyzeLiveSentiment(transcribedText);

        res.json({
          sentiment,
          transcribed_text: transcribedText,
        });
      } catch (error: any) {
        await fs.unlink(audioPath);
        throw error;
      }
    } catch (error) {
      console.error("Audio analysis error:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to analyze audio",
      });
    }
  });

  app.get("/api/sentiment/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const validTypes = ["positive", "negative", "neutral"];

      if (!validTypes.includes(type.toLowerCase())) {
        return res.status(400).json({ error: "Invalid sentiment type" });
      }

      const result = await storage.getLatestAnalysisResult();

      if (!result) {
        return res.status(404).json({ error: "No analysis results found" });
      }

      const sentimentType = type.charAt(0).toUpperCase() + type.slice(1);
      const reviews =
        result.grouped_reviews[
          sentimentType as keyof typeof result.grouped_reviews
        ];

      res.json({
        sentiment: sentimentType,
        reviews: reviews || [],
        count: reviews?.length || 0,
      });
    } catch (error) {
      console.error("Get sentiment error:", error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to get sentiment data",
      });
    }
  });

  app.get("/api/latest-result", async (req, res) => {
    try {
      const result = await storage.getLatestAnalysisResult();

      if (!result) {
        return res.status(404).json({ error: "No analysis results found" });
      }

      res.json(result);
    } catch (error) {
      console.error("Get latest result error:", error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to get latest result",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
