import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import type { SentimentResult, SentimentType } from "@shared/schema";

export default function DetailsPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/details/:sentiment');
  const [reviews, setReviews] = useState<string[]>([]);
  const [sentimentType, setSentimentType] = useState<string>('');

  useEffect(() => {
    const sentiment = params?.sentiment;
    if (!sentiment) {
      setLocation('/');
      return;
    }

    const capitalizedSentiment = sentiment.charAt(0).toUpperCase() + sentiment.slice(1) as SentimentType;
    setSentimentType(capitalizedSentiment);

    const storedResult = sessionStorage.getItem('sentimentResult');
    if (storedResult) {
      const result: SentimentResult = JSON.parse(storedResult);
      setReviews(result.grouped_reviews[capitalizedSentiment] || []);
    } else {
      setLocation('/');
    }
  }, [params, setLocation]);

  const getSentimentIcon = () => {
    switch (sentimentType.toLowerCase()) {
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-sentiment-positive" />;
      case 'negative':
        return <XCircle className="w-5 h-5 text-sentiment-negative" />;
      default:
        return <MinusCircle className="w-5 h-5 text-sentiment-neutral" />;
    }
  };

  const getSentimentColor = () => {
    switch (sentimentType.toLowerCase()) {
      case 'positive':
        return 'text-sentiment-positive';
      case 'negative':
        return 'text-sentiment-negative';
      default:
        return 'text-sentiment-neutral';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/results')}
            className="mb-4"
            data-testid="button-back-results"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
          <div className="flex items-center gap-3">
            {getSentimentIcon()}
            <h1 className={`text-3xl md:text-4xl font-bold ${getSentimentColor()}`} data-testid="heading-sentiment-type">
              {sentimentType} Reviews
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" data-testid="review-count">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </Badge>
          </div>
        </div>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  {getSentimentIcon()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-reviews">
                    No {sentimentType.toLowerCase()} reviews found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    There are no reviews with {sentimentType.toLowerCase()} sentiment in this analysis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <Card 
                key={index} 
                className="hover-elevate transition-all duration-200"
                data-testid={`review-${index}`}
              >
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      {getSentimentIcon()}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed flex-1" data-testid={`text-review-${index}`}>
                      {review}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
