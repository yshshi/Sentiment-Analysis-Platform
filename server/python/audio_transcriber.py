#!/usr/bin/env python3
import sys
import json
import os
import tempfile
from pydub import AudioSegment
import speech_recognition as sr

def transcribe_audio(file_path):
    recognizer = sr.Recognizer()
    temp_wav_path = None

    try:
        # ✅ Convert .webm → .wav if needed
        if file_path.lower().endswith(".webm"):
            # Convert using pydub
            audio = AudioSegment.from_file(file_path, format="webm")

            # Save converted file in temp directory
            temp_wav_path = tempfile.mktemp(suffix=".wav")
            audio.export(temp_wav_path, format="wav")

            file_path = temp_wav_path

        # ✅ Now transcribe using speech_recognition
        with sr.AudioFile(file_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)
            return {"text": text}, 200

    except sr.UnknownValueError:
        return {"error": "Could not understand audio. Please speak more clearly."}, 400
    except sr.RequestError as e:
        return {"error": f"Could not request results from Google Speech Recognition service: {str(e)}"}, 500
    except Exception as e:
        return {"error": f"Error processing audio: {str(e)}"}, 500
    finally:
        # ✅ Clean up temporary WAV file if created
        if temp_wav_path and os.path.exists(temp_wav_path):
            os.remove(temp_wav_path)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Invalid arguments"}))
        sys.exit(1)

    file_path = sys.argv[1]
    result, status_code = transcribe_audio(file_path)
    print(json.dumps(result))
    sys.exit(0 if status_code == 200 else 1)
