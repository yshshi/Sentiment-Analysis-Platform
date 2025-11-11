#!/usr/bin/env python3
import sys
import json
import re
import pandas as pd
from io import BytesIO
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    nltk.data.find('vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon', quiet=True)

try:
    nltk.data.find('stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

try:
    nltk.data.find('wordnet')
except LookupError:
    nltk.download('wordnet', quiet=True)

sia = SentimentIntensityAnalyzer()
stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\d', '', text)
    words = text.split()
    words = [w for w in words if w not in stop_words]
    words = [lemmatizer.lemmatize(w) for w in words]
    return " ".join(words)

def get_sentiment(text):
    score = sia.polarity_scores(text)
    if score["compound"] > 0.05:
        return "Positive"
    elif score["compound"] < -0.05:
        return "Negative"
    else:
        return "Neutral"

def extract_text_from_pdf(file_path):
    if PyPDF2 is None:
        raise ImportError("PyPDF2 is not installed")
    
    texts = []
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text = page.extract_text()
            if text.strip():
                lines = text.split('\n')
                for line in lines:
                    line = line.strip()
                    if line and len(line) > 10:
                        texts.append(line)
    return texts

def analyze_file(file_path, file_type):
    try:
        if file_type == 'csv':
            df = pd.read_csv(file_path)
        elif file_type in ['xlsx', 'xls']:
            df = pd.read_excel(file_path)
        elif file_type == 'pdf':
            texts = extract_text_from_pdf(file_path)
            if not texts:
                return {"error": "No readable text found in PDF file"}, 400
            df = pd.DataFrame({'reviewText': texts})
        else:
            return {"error": "Invalid file format. Please upload CSV, XLSX, or PDF files only."}, 400
    except Exception as e:
        return {"error": f"Error reading file: {str(e)}"}, 400

    if "reviewText" not in df.columns:
        return {"error": "Missing 'reviewText' column in the uploaded file"}, 400
    
    if df.empty or df["reviewText"].dropna().empty:
        return {"error": "The uploaded file contains no valid data to analyze"}, 400

    df["cleaned_text"] = df["reviewText"].apply(clean_text)
    df["sentiment"] = df["cleaned_text"].apply(get_sentiment)

    sentiment_counts = df["sentiment"].value_counts().to_dict()
    total = sum(sentiment_counts.values())
    
    if total == 0:
        return {"error": "No valid text data found for sentiment analysis"}, 400

    sentiment_percentages = {
        "Positive": round((sentiment_counts.get("Positive", 0) / total) * 100, 2),
        "Negative": round((sentiment_counts.get("Negative", 0) / total) * 100, 2),
        "Neutral": round((sentiment_counts.get("Neutral", 0) / total) * 100, 2)
    }
    
    grouped_reviews = {
        "Positive": df[df["sentiment"] == "Positive"]["reviewText"].tolist(),
        "Negative": df[df["sentiment"] == "Negative"]["reviewText"].tolist(),
        "Neutral": df[df["sentiment"] == "Neutral"]["reviewText"].tolist()
    }

    return {
        "success": True,
        "sentiment_counts": sentiment_counts,
        "sentiment_percentages": sentiment_percentages,
        "grouped_reviews": grouped_reviews
    }, 200

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Invalid arguments"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    file_type = sys.argv[2]
    
    result, status_code = analyze_file(file_path, file_type)
    print(json.dumps(result))
    sys.exit(0 if status_code == 200 else 1)
