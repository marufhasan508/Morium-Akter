
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mistake, AppRoute } from '../types';
import Robot from '../components/Robot';
import { analyzeSpeech, generateSpeech, decodeAudioData } from '../services/geminiService';

interface HomePageProps {
  user: User;
  onUpdatePoints: (amount: number) => void;
  onAddMistake: (mistake: Omit<Mistake, 'id' | 'timestamp'>) => void;
  onLogout: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, onUpdatePoints, onAddMistake, onLogout }) => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'permission' | 'other' | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsRecording(false);
        handleAnalysis(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        if (event.error === 'not-allowed') {
          setErrorType('permission');
          setFeedback("Microphone access denied. Please enable it in browser settings.");
        } else if (event.error === 'no-speech') {
          setFeedback("No speech detected. Try speaking again.");
        } else {
          setErrorType('other');
          setFeedback(`Error: ${event.error}. Please try again.`);
        }
      };

      recognitionRef.current.onstart = () => {
        setErrorType(null);
      };
    } else {
      setFeedback("Speech Recognition is not supported in this browser.");
    }
  }, []);

  const handleAnalysis = async (text: string) => {
    setIsAnalyzing(true);
    setFeedback("Nova is thinking...");
    
    try {
      const result = await analyzeSpeech(text);
      
      // Calculate Point Impact
      let impact = 0;
      if (result.hasBengali) {
        impact = -10;
        onAddMistake({
          originalText: text,
          correctedText: "Speak only in English please.",
          feedback: "Bengali detected. Please stick to English to improve!",
          pointsDeducted: 10,
          type: 'language'
        });
        setFeedback("Please speak only in English! (-10 pts)");
      } else if (!result.isCorrect) {
        impact = -10;
        onAddMistake({
          originalText: text,
          correctedText: result.correction,
          feedback: result.feedback,
          pointsDeducted: 10,
          type: 'grammar'
        });
        setFeedback(`Mistake: ${result.feedback} (-10 pts)`);
      } else {
        impact = 10;
        setFeedback("Perfect! (+10 pts)");
      }
      
      onUpdatePoints(impact);

      // Nova Responds (TTS)
      const audioBytes = await generateSpeech(result.response);
      if (audioBytes) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        const buffer = await decodeAudioData(audioBytes, ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(false);
        setIsSpeaking(true);
        source.start(0);
      }
    } catch (err) {
      console.error(err);
      setFeedback("Sorry, I had trouble understanding. Try again?");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setFeedback(null);
      setErrorType(null);

      try {
        // Explicitly request microphone permission first to handle 'not-allowed' gracefully
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Microphone permission error:', err);
        setErrorType('permission');
        setFeedback("Microphone access denied. Please allow microphone access to practice speaking.");
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col p-6 max-w-4xl mx-auto overflow-hidden">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-12">
        <button 
          onClick={() => navigate(`/${AppRoute.MISTAKES}`)}
          className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
          title="View Mistakes"
        >
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 text-white px-5 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {user.points} pts
          </div>
          <button 
             onClick={() => { if(confirm("Log out?")) onLogout(); }}
             className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
             title="Settings / Logout"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="mb-4 text-center min-h-[4rem] px-8">
           {transcript && (
             <p className="text-slate-500 italic mb-2">"{transcript}"</p>
           )}
           {feedback && (
             <div className={`inline-block px-4 py-2 bg-white/80 backdrop-blur rounded-xl font-medium shadow-sm border animate-fade-in ${
               errorType === 'permission' ? 'text-red-600 border-red-100' : 'text-indigo-600 border-indigo-50'
             }`}>
               {feedback}
             </div>
           )}
        </div>

        <Robot isListening={isRecording} isSpeaking={isSpeaking} />
        
        <div className="mt-12 text-center text-slate-400 font-medium">
          {isRecording ? "Listening to you..." : isAnalyzing ? "Analyzing speech..." : isSpeaking ? "Nova is responding..." : "Tap to speak with Nova"}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="mt-auto flex justify-center pb-8">
        <button
          onClick={toggleRecording}
          disabled={isAnalyzing || isSpeaking}
          className={`group relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-90 ${
            isRecording 
            ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-110' 
            : 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:scale-110'
          } ${(isAnalyzing || isSpeaking) ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={isRecording ? "Stop Recording" : "Start Recording"}
        >
          {isRecording ? (
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default HomePage;
