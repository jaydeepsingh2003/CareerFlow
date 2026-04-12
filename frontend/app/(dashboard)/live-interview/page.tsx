"use client";

import React, { useState, useRef } from 'react';
import { ai, submitAssessmentResultsDeclaration } from '@/lib/gemini';
import { Mic, Loader2, Square, BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';

export default function VoiceAssessmentPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 pt-10">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Mic className="h-8 w-8 text-indigo-500" /> AI Voice Assessment
                </h1>
                <p className="text-muted-foreground mt-1">Direct Implementation Module</p>
            </div>
            
            <VoiceAssessment />
        </div>
    );
}

function VoiceAssessment() {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);

  // Helper to play audio chunks sequentially
  const playNextAudio = () => {
    if (audioQueueRef.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      return;
    }
    
    isPlayingRef.current = true;
    const audioBuffer = audioQueueRef.current.shift()!;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = playNextAudio;
    source.start();
  };

  const startInterview = async () => {
    setIsConnecting(true);
    try {
      // 1. Capture Microphone with explicit permission handling
      try {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            } 
        });
      } catch (permErr: any) {
        setIsConnecting(false);
        if (permErr.name === 'NotAllowedError') {
          toast.error("Microphone Access Denied. Please enable permissions in your browser settings.");
        } else {
          toast.error("Could not access microphone: " + permErr.message);
        }
        return;
      }

      // 2. Setup Web Audio API
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
      }
      
      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      // 3. Connect to the Gemini Live API
      const sessionPromise = ai.live.connect({
        model: "gemini-2.0-flash-exp",
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsRecording(true);
            toast.success("AI Voice Session Established");

              // 4. Stream audio data from the microphone
              processorRef.current!.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                
                // Volume check (RMS) to detect silence
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                const rms = Math.sqrt(sum / inputData.length);
                if (rms < 0.005) return; // Skip silence to save bandwidth/API stress

                const pcm16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                  pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
                }

                // Robust Base64 conversion
                const uint8 = new Uint8Array(pcm16.buffer);
                let binary = '';
                const chunkSize = 8192;
                for (let i = 0; i < uint8.length; i += chunkSize) {
                    binary += String.fromCharCode.apply(null, Array.from(uint8.subarray(i, i + chunkSize)));
                }
                const base64Data = btoa(binary);
                
                sessionPromise.then((session: any) => {
                try {
                    if (typeof session.send === 'function') {
                        session.send({ realtimeInput: { mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: base64Data }] } });
                    } else {
                        session.sendRealtimeInput([{ mimeType: 'audio/pcm;rate=16000', data: base64Data }]);
                    }
                } catch(e) {}
              }).catch(() => {});
            };
          },
          onmessage: async (message: any) => {
            // 5. Handle binary audio packets from Gemini
            if (message.serverContent?.modelTurn?.parts) {
              const audioPart = message.serverContent.modelTurn.parts.find((p: any) => p.inlineData?.mimeType?.startsWith('audio/') || p.inlineData?.data);
              const textPart = message.serverContent.modelTurn.parts.find((p: any) => p.text);

              if (audioPart && audioContextRef.current) {
                console.log("🔊 AI Audio Received");
                const base64 = audioPart.inlineData.data;
                const binaryString = atob(base64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                
                // Gemini returns 16-bit PCM at 24kHz
                const int16Array = new Int16Array(bytes.buffer);
                const float32Array = new Float32Array(int16Array.length);
                for (let i = 0; i < int16Array.length; i++) {
                  float32Array[i] = int16Array[i] / 32768.0;
                }
                
                const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
                audioBuffer.getChannelData(0).set(float32Array);
                
                audioQueueRef.current.push(audioBuffer);
                
                // Force resume in case of browser-level suspension
                if (audioContextRef.current.state === 'suspended') {
                  await audioContextRef.current.resume();
                }

                if (!isPlayingRef.current) {
                  playNextAudio();
                }
              } else if (textPart && textPart.text) {
                  console.log("💬 AI Text Received:", textPart.text);
                  const ut = new SpeechSynthesisUtterance(textPart.text);
                  window.speechSynthesis.speak(ut);
              }
            }

            // 6. Handle interruptions (e.g., user starts speaking while AI is talking)
            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
            }

            // 7. Handle the Tool Call when the AI finishes the assessment
            if (message.toolCall) {
              const call = message.toolCall.functionCalls[0];
              if (call.name === 'submitAssessmentResults') {
                // Save the results
                setResults(call.args);
                setCompleted(true);
                stopInterview();
                
                // Acknowledge the tool call back to the server
                sessionPromise.then((session: any) => {
                  const resp = { functionResponses: [{ id: call.id, name: call.name, response: { success: true } }] };
                  if (typeof session.send === 'function') session.send({ toolResponse: resp });
                  else session.sendToolResponse(resp);
                });
              }
            }
          },
          onerror: (e) => {
            console.error("Live API Error:", e);
            toast.error("AI Connection Interrupted.");
            stopInterview();
          },
          onclose: () => stopInterview()
        },
        config: {
          responseModalities: ["AUDIO" as any],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Aoede" // Valid options: Aoede, Charon, Fenrir, Kore, Puck
              }
            }
          },
          systemInstruction: { parts: [{ text: "You are an AI Interview Engine. Your goal is to evaluate the user's skills. Ask 3-5 adaptive questions based on their domain. Be conversational and professional. Start the interview by asking the user to introduce themselves and their field of expertise. At the end of the interview, you MUST output a JSON object containing the extracted skills and scores (0.0 to 1.0). Format: { \"domain\": \"...\", \"skills\": [{ \"name\": \"...\", \"score\": 0.8 }] }" }] },
          tools: [{ functionDeclarations: [submitAssessmentResultsDeclaration] }]
        }
      });
      
      sessionRef.current = await sessionPromise as any;
      
      // Kickoff Interaction
      try {
        const kickoff = "Hello, I'm ready for my interview.";
        if (typeof sessionRef.current.send === 'function') {
            sessionRef.current.send({ clientContent: { turns: [{ role: "user", parts: [{ text: kickoff }] }] } });
        } else {
            sessionRef.current.sendRealtimeInput([{ text: kickoff }]);
        }
      } catch (err) {}
      
    } catch (err: any) {
      console.error("Failed to start session:", err);
      toast.error("Initialization failed: " + err.message);
      setIsConnecting(false);
    }
  };

  const stopInterview = () => {
    setIsRecording(false);
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-black/40 border border-white/10 rounded-2xl shadow-2xl space-y-6">
      <div className="flex items-center gap-4 border-b border-white/5 pb-4">
        <BrainCircuit className="h-8 w-8 text-primary" />
        <h2 className="text-2xl font-bold text-white">Neural Voice Engine</h2>
      </div>
      
      {!completed ? (
        <div className="flex flex-col items-center gap-8 py-10">
          <button
            onClick={isRecording ? stopInterview : startInterview}
            disabled={isConnecting}
            className={`px-10 py-5 rounded-full font-black text-lg transition-all flex items-center gap-3 ${
              isConnecting ? 'bg-gray-800 text-gray-400 border border-white/10' : 
              isRecording ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 
              'bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_rgba(124,58,237,0.3)]'
            }`}
          >
            {isConnecting ? <><Loader2 className="animate-spin h-6 w-6" /> Booting Core...</> : 
             isRecording ? <><Square className="h-6 w-6 fill-current" /> Terminate Link</> : 
             <><Mic className="h-6 w-6" /> Initiate Voice Link</>}
          </button>
          
          {isRecording && (
            <p className="text-sm font-medium text-red-400 animate-pulse bg-red-500/10 px-6 py-2 rounded-full border border-red-500/20">
              ● Recording Active: Speak naturally. Do not wait for prompts.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-emerald-400 border-b border-emerald-500/20 pb-2">Assessment Concluded</h3>
          <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4">
            <p className="text-white"><strong className="text-muted-foreground uppercase text-xs tracking-widest block mb-1">Detected Domain</strong> <span className="text-xl">{results?.domain}</span></p>
            <p className="text-white"><strong className="text-muted-foreground uppercase text-xs tracking-widest block mb-1">Confidence Score</strong> <span className="text-xl">{Math.round(results?.confidence * 100)}%</span></p>
            
            <div className="pt-4 border-t border-white/10">
                <h4 className="font-bold text-white mb-4 uppercase text-xs tracking-widest text-muted-foreground">Extracted Skills Matrix</h4>
                <ul className="space-y-3">
                {results?.skills?.map((skill: any, i: number) => (
                    <li key={i} className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-white">{skill.name}</span>
                            <span className="text-muted-foreground">{Math.round(skill.score * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${skill.score * 100}%` }} />
                        </div>
                    </li>
                ))}
                </ul>
            </div>
          </div>
          <button 
            onClick={() => setCompleted(false)}
            className="text-primary hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
          >
            ↺ Reinitialize Protocol
          </button>
        </div>
      )}
    </div>
  );
}
