import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  MinusCircle,
  Mic,
  MicOff,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function LiveAnalysisCard() {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [sentiment, setSentiment] = useState<string | null>(null);
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // === Mutation for analyzing text ===
  const textMutation = useMutation({
    mutationFn: async (inputText: string): Promise<{ sentiment: string }> => {
      console.log("Sending text to /api/live-text:", inputText);
      const response = await apiRequest("POST", "/api/live-text", { text: inputText });
      const data = await response.json();
      console.log("Received response:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("Sentiment received:", data.sentiment);
      setSentiment(data.sentiment);
      toast({
        title: "Analysis complete!",
        description: `Sentiment: ${data.sentiment}`,
      });
    },
    onError: (error) => {
      console.error("Text analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description:
          error instanceof Error ? error.message : "Failed to analyze text",
      });
    },
  });

  const handleTextAnalyze = () => {
    if (text.trim()) {
      console.log("Analyzing typed text:", text);
      setSentiment(null);
      textMutation.mutate(text);
    }
  };

  // === Voice Recording ===
  const startRecording = () => {
    const SpeechRecognition =
      (window.SpeechRecognition || window.webkitSpeechRecognition) as typeof window.SpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        variant: "destructive",
        title: "Speech recognition not supported",
        description: "Try using Chrome or Edge browser.",
      });
      console.error("SpeechRecognition API not supported in this browser.");
      return;
    }

    console.log("Initializing SpeechRecognition...");
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log("Speech recognition started...");
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results as SpeechRecognitionResultList)
        .map((res: SpeechRecognitionResult) => res[0])
        .map((res: SpeechRecognitionAlternative) => res.transcript)
        .join("");
      console.log("Recognized speech:", transcript);

      setText(transcript);
      setIsRecording(false);

      // Send recognized text to backend
      console.log("Sending recognized text for analysis...");
      setSentiment(null);
      textMutation.mutate(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended.");
      setIsRecording(false);
    };

    recognition.start();
  };

  const stopRecording = () => {
    console.log("Stopping speech recognition...");
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const getSentimentColor = (sentimentValue: string) => {
    switch (sentimentValue.toLowerCase()) {
      case "positive":
        return "text-sentiment-positive";
      case "negative":
        return "text-sentiment-negative";
      default:
        return "text-sentiment-neutral";
    }
  };

  const getSentimentIcon = (sentimentValue: string) => {
    switch (sentimentValue.toLowerCase()) {
      case "positive":
        return <CheckCircle className="w-5 h-5" />;
      case "negative":
        return <XCircle className="w-5 h-5" />;
      default:
        return <MinusCircle className="w-5 h-5" />;
    }
  };

  return (
    <Card className="hover-elevate transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-2xl">Live Sentiment Analysis</CardTitle>
        <CardDescription>
          Analyze sentiment in real-time using text input or voice recording
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="text">Text Input</TabsTrigger>
            <TabsTrigger value="voice">Voice Input</TabsTrigger>
          </TabsList>

          {/* TEXT INPUT */}
          <TabsContent value="text" className="space-y-4">
            <Textarea
              placeholder="Enter text to analyze..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-32 resize-vertical"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{text.length} characters</p>
            </div>
            <Button
              onClick={handleTextAnalyze}
              disabled={!text.trim() || textMutation.isPending}
              className="w-full h-12"
            >
              {textMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Sentiment"
              )}
            </Button>
          </TabsContent>

          {/* VOICE INPUT */}
          <TabsContent value="voice" className="space-y-6">
            <div className="flex flex-col items-center justify-center gap-6 py-8">
              <Button
                onClick={() => {
                  if (isRecording) stopRecording();
                  else startRecording();
                }}
                disabled={textMutation.isPending}
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  isRecording ? "animate-pulse" : ""
                }`}
              >
                {textMutation.isPending ? (
                  <Loader2 className="w-10 h-10 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-10 h-10" />
                ) : (
                  <Mic className="w-10 h-10" />
                )}
              </Button>

              <div className="text-center">
                <p className="text-base font-medium text-foreground">
                  {textMutation.isPending
                    ? "Analyzing..."
                    : isRecording
                    ? "Tap to stop recording"
                    : "Tap to speak"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isRecording
                    ? "Recording in progress"
                    : "Click the microphone to start"}
                </p>
              </div>
            </div>

            {text && (
              <div className="p-4 bg-accent rounded-lg" data-testid="transcribed-text">
                <p className="text-sm font-medium text-foreground mb-1">
                  Transcribed Text:
                </p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {sentiment && (
          <div className="mt-6 p-6 bg-accent rounded-lg flex items-center justify-center gap-3">
            <div className={getSentimentColor(sentiment)}>
              {getSentimentIcon(sentiment)}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sentiment:</p>
              <p
                className={`text-2xl font-semibold capitalize ${getSentimentColor(
                  sentiment
                )}`}
              >
                {sentiment}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
