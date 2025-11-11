import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload, FileText, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadCardProps {
  onUploadSuccess: (data: any) => void;
}

export function FileUploadCard({ onUploadSuccess }: FileUploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validExtensions = ['.csv', '.xlsx', '.pdf'];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      toast({
        variant: "destructive",
        title: "Invalid file format",
        description: "Please upload a CSV, XLSX, or PDF file.",
      });
      return;
    }
    
    setFile(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze file');
      }

      toast({
        title: "Analysis complete!",
        description: "Your sentiment analysis results are ready.",
      });

      onUploadSuccess(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="hover-elevate transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-2xl">File Upload Analysis</CardTitle>
        <CardDescription>
          Upload CSV, XLSX, or PDF files containing reviews for sentiment analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            min-h-64 border-2 border-dashed rounded-lg
            flex flex-col items-center justify-center gap-4
            cursor-pointer transition-all duration-200
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/50'}
          `}
          data-testid="file-upload-dropzone"
        >
          <CloudUpload className={`w-16 h-16 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          <div className="text-center">
            <p className="text-base font-medium text-foreground mb-1">
              {isDragging ? 'Drop file here' : 'Drop file here or click to browse'}
            </p>
            <p className="text-sm text-muted-foreground">
              Supported formats: CSV, XLSX, PDF
            </p>
             <p className="text-sm text-muted-foreground">
              Review data should be inside the columne name "reviewText"
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.pdf"
          onChange={handleFileChange}
          className="hidden"
          data-testid="input-file"
        />

        {file && (
          <div className="flex items-center gap-3 p-4 bg-accent rounded-lg" data-testid="file-selected">
            <FileText className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              disabled={isUploading}
              data-testid="button-remove-file"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={!file || isUploading}
          className="w-full h-12"
          size="lg"
          data-testid="button-analyze-file"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze File'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
