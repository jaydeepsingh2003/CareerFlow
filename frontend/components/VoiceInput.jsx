"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Square } from "lucide-react";

export default function VoiceInput({ value, onChange, onStopRecording, disabled }) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    setError("");
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = true; // Stay listening until explicitly stopped
    recognitionRef.current = recognition;

    let finalTranscript = "";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let latestFinal = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          latestFinal += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      finalTranscript += latestFinal;
      // Send the current combined transcript up, but wait for explicit stop to submit
      onChange((value ? value + " " : "") + finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        setError("Please allow microphone access.");
      } else if (event.error === "no-speech") {
        setError("No speech detected.");
      } else {
        setError("Mic error: " + event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  }, [value, onChange]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    if (onStopRecording) {
      onStopRecording();
    }
  }, [onStopRecording]);

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        title={isListening ? "Stop and Submit" : "Tap to Speak"}
        className={[
          "relative h-24 w-24 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-500",
          disabled
            ? "opacity-40 cursor-not-allowed bg-white/5 border border-white/10"
            : isListening
            ? "bg-red-500/20 border-2 border-red-500 scale-110 shadow-[0_0_40px_rgba(239,68,68,0.6)] cursor-pointer"
            : "bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-xl shadow-violet-500/20 cursor-pointer",
        ].join(" ")}
      >
        {/* Pulse rings when recording */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
            <span className="absolute inset-[-10px] rounded-full border border-red-500/30 animate-pulse" />
          </>
        )}
        {isListening ? (
          <Square className="h-8 w-8 text-red-100 fill-red-100 relative z-10" />
        ) : (
          <Mic className="h-10 w-10 text-white relative z-10" />
        )}
      </button>

      <div className="text-center h-8">
        {isListening ? (
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-400 animate-pulse">
            Listening... Tap Square to Submit
          </p>
        ) : disabled ? (
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-400 animate-pulse">
            AI is Speaking / Thinking...
          </p>
        ) : (
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/50">
            Tap Microphone to Speak Answer
          </p>
        )}
      </div>

      {error && (
        <p className="text-[11px] text-amber-400 text-center max-w-[200px] leading-relaxed">
          {error}
        </p>
      )}
    </div>
  );
}
