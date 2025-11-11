import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Loader2, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function LiveAnalysisCard() {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [sentiment, setSentiment] = useState<string | null>(null);
  const { toast } = useToast();

  const textMutation = useMutation({
  mutationFn: async (inputText: string): Promise<{ sentiment: string }> => {
    const response = await apiRequest("POST", "/api/live-text", { text: inputText });

    // Make sure to parse JSON before returning
    const data = await response.json();

    return data; // now TypeScript knows it's { sentiment: string }
  },
  onSuccess: (data) => {
    setSentiment(data.sentiment);
    toast({
      title: "Analysis complete!",
      description: `Sentiment: ${data.sentiment}`,
    });
  },
  onError: (error) => {
    toast({
      variant: "destructive",
      title: "Analysis failed",
      description: error instanceof Error ? error.message : "Failed to analyze text",
    });
  },
});


  const audioMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await fetch('/api/live-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze audio');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setSentiment(data.sentiment);
      if (data.transcribed_text) {
        setText(data.transcribed_text);
      }
      toast({
        title: "Analysis complete!",
        description: `Sentiment: ${data.sentiment}`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze audio",
      });
    },
  });

  const handleTextAnalyze = () => {
    if (text.trim()) {
      setSentiment(null);
      textMutation.mutate(text);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setAudioChunks([]);
        setSentiment(null);
        audioMutation.mutate(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice recording.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const getSentimentColor = (sentimentValue: string) => {
    switch (sentimentValue.toLowerCase()) {
      case 'positive':
        return 'text-sentiment-positive';
      case 'negative':
        return 'text-sentiment-negative';
      default:
        return 'text-sentiment-neutral';
    }
  };

  const getSentimentIcon = (sentimentValue: string) => {
    switch (sentimentValue.toLowerCase()) {
      case 'positive':
        return <CheckCircle className="w-5 h-5" />;
      case 'negative':
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
            <TabsTrigger value="text" data-testid="tab-text">Text Input</TabsTrigger>
            <TabsTrigger value="voice" data-testid="tab-voice">Voice Input</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <Textarea
              placeholder="Enter text to analyze..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-32 resize-vertical"
              data-testid="input-text-sentiment"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {text.length} characters
              </p>
            </div>
            <Button
              onClick={handleTextAnalyze}
              disabled={!text.trim() || textMutation.isPending}
              className="w-full h-12"
              size="lg"
              data-testid="button-analyze-text"
            >
              {textMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Sentiment'
              )}
            </Button>
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <div className="flex flex-col items-center justify-center gap-6 py-8">
              <Button
              onClick={() => {
    toast({
      title: "Feature in development",
      description: "Audio analysis is still in development.",
      variant: "default", // or "destructive" for red-style toast
    });
  }}
  // className="cursor-pointer flex items-center"
  className={`
                  w-24 h-24 rounded-full
                  cursor-pointer flex items-center
                `}
                data-testid="button-record-voice"
                // onClick={isRecording ? stopRecording : startRecording}
                // disabled={audioMutation.isPending}
                // size="lg"
                // variant={isRecording ? "destructive" : "default"}
                // className={`
                //   w-24 h-24 rounded-full
                //   ${isRecording ? 'animate-pulse' : ''}
                // `}
                // data-testid="button-record-voice"
              >
                {audioMutation.isPending ? (
                  <Loader2 className="w-10 h-10 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-10 h-10" />
                ) : (
                  <Mic className="w-10 h-10" />
                )}
              </Button>
              <div className="text-center">
                <p className="text-base font-medium text-foreground">
                  {audioMutation.isPending
                    ? 'Analyzing audio...'
                    : isRecording
                    ? 'Tap to stop recording'
                    : 'Tap to speak'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isRecording ? 'Recording in progress' : 'Click the microphone to start'}
                </p>
              </div>
            </div>

            {text && (
              <div className="p-4 bg-accent rounded-lg" data-testid="transcribed-text">
                <p className="text-sm font-medium text-foreground mb-1">Transcribed Text:</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {sentiment && (
          <div className="mt-6 p-6 bg-accent rounded-lg flex items-center justify-center gap-3" data-testid="sentiment-result">
            <div className={getSentimentColor(sentiment)}>
              {getSentimentIcon(sentiment)}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sentiment:</p>
              <p className={`text-2xl font-semibold capitalize ${getSentimentColor(sentiment)}`}>
                {sentiment}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
