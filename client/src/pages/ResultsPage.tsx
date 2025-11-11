import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SentimentPieChart } from "@/components/SentimentPieChart";
import { ArrowLeft, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import type { SentimentResult } from "@shared/schema";

export default function ResultsPage() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<SentimentResult | null>(null);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('sentimentResult');
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  if (!result) {
    return null;
  }

  const totalReviews = 
    (result.sentiment_counts.Positive || 0) +
    (result.sentiment_counts.Negative || 0) +
    (result.sentiment_counts.Neutral || 0);

  const handleViewDetails = (sentiment: string) => {
    setLocation(`/details/${sentiment.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-4"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="heading-results">Analysis Results</h1>
          <p className="text-muted-foreground mt-2">
            Total reviews analyzed: <span className="font-semibold text-foreground" data-testid="text-total-reviews">{totalReviews}</span>
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Distribution</CardTitle>
              <CardDescription>
                Visual breakdown of sentiment analysis across all reviews
              </CardDescription>
            </CardHeader>
            <CardContent className="py-8">
              <SentimentPieChart percentages={result.sentiment_percentages} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-200"
              onClick={() => handleViewDetails('positive')}
              data-testid="card-positive"
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-sentiment-positive/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-sentiment-positive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">Positive</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="count-positive">
                      {result.sentiment_counts.Positive || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sentiment-positive" data-testid="percentage-positive">
                    {result.sentiment_percentages.Positive.toFixed(1)}%
                  </Badge>
                  <p className="text-xs text-muted-foreground">of total reviews</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-200"
              onClick={() => handleViewDetails('negative')}
              data-testid="card-negative"
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-sentiment-negative/10 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-6 h-6 text-sentiment-negative" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">Negative</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="count-negative">
                      {result.sentiment_counts.Negative || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sentiment-negative" data-testid="percentage-negative">
                    {result.sentiment_percentages.Negative.toFixed(1)}%
                  </Badge>
                  <p className="text-xs text-muted-foreground">of total reviews</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-200"
              onClick={() => handleViewDetails('neutral')}
              data-testid="card-neutral"
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-sentiment-neutral/10 flex items-center justify-center flex-shrink-0">
                    <MinusCircle className="w-6 h-6 text-sentiment-neutral" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">Neutral</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="count-neutral">
                      {result.sentiment_counts.Neutral || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sentiment-neutral" data-testid="percentage-neutral">
                    {result.sentiment_percentages.Neutral.toFixed(1)}%
                  </Badge>
                  <p className="text-xs text-muted-foreground">of total reviews</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
