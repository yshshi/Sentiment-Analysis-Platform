import { useState } from "react";
import { useLocation } from "wouter";
import { FileUploadCard } from "@/components/FileUploadCard";
import { LiveAnalysisCard } from "@/components/LiveAnalysisCard";
import type { SentimentResult } from "@shared/schema";

export default function HomePage() {
  const [, setLocation] = useLocation();

  const handleUploadSuccess = (data: SentimentResult) => {
    sessionStorage.setItem('sentimentResult', JSON.stringify(data));
    setLocation('/results');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="heading-home">
            Sentiment Analysis Platform
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-subtitle">
            Analyze user feedback from files or get real-time sentiment insights using text and voice input
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FileUploadCard onUploadSuccess={handleUploadSuccess} />
          <LiveAnalysisCard />
        </div>
      </div>
    </div>
  );
}
