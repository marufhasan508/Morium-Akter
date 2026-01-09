
import React from 'react';

interface RobotProps {
  isListening: boolean;
  isSpeaking: boolean;
}

const Robot: React.FC<RobotProps> = ({ isListening, isSpeaking }) => {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
      {/* Background Pulse for Listening State */}
      {isListening && (
        <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping" />
      )}
      
      {/* Main Robot SVG */}
      <svg
        viewBox="0 0 200 200"
        className={`w-full h-full drop-shadow-2xl transition-transform duration-500 ${isSpeaking ? 'scale-105' : 'scale-100'}`}
      >
        {/* Head */}
        <path
          d="M60 40 Q100 20 140 40 L145 120 Q100 140 55 120 Z"
          fill="#ffffff"
          stroke="#4f46e5"
          strokeWidth="4"
        />
        
        {/* Eyes */}
        <g className={isListening ? 'animate-pulse' : ''}>
          <circle cx="80" cy="75" r="8" fill="#4f46e5" />
          <circle cx="120" cy="75" r="8" fill="#4f46e5" />
          {/* Eye glow */}
          <circle cx="80" cy="75" r="3" fill="#818cf8" />
          <circle cx="120" cy="75" r="3" fill="#818cf8" />
        </g>
        
        {/* Mouth/Speaker area */}
        <rect
          x="85"
          y="100"
          width="30"
          height="8"
          rx="4"
          fill="#4f46e5"
          className={isSpeaking ? 'animate-bounce' : 'opacity-40'}
        />

        {/* Antenna */}
        <line x1="100" y1="35" x2="100" y2="15" stroke="#4f46e5" strokeWidth="3" />
        <circle
          cx="100"
          cy="15"
          r="5"
          fill={isListening ? "#f87171" : "#4f46e5"}
          className={isListening ? 'animate-pulse' : ''}
        />
        
        {/* Shoulders */}
        <path
          d="M40 160 Q100 130 160 160 L160 200 L40 200 Z"
          fill="#ffffff"
          stroke="#4f46e5"
          strokeWidth="4"
        />
      </svg>
      
      {/* Floating Indicators */}
      {isSpeaking && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-indigo-100 flex gap-1">
          <div className="w-1 h-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-1 h-6 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1 h-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      )}
    </div>
  );
};

export default Robot;
