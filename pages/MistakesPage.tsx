
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mistake, AppRoute } from '../types';

interface MistakesPageProps {
  mistakes: Mistake[];
}

const MistakesPage: React.FC<MistakesPageProps> = ({ mistakes }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <button 
          onClick={() => navigate(`/${AppRoute.HOME}`)}
          className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"
        >
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Journey</h1>
          <p className="text-slate-500">Review your past mistakes to grow faster.</p>
        </div>
      </div>

      {mistakes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
             <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
             </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800">No mistakes yet!</h2>
          <p className="text-slate-500">Keep speaking to see your progress tracked here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {mistakes.map((mistake) => (
            <div 
              key={mistake.id}
              className="group p-6 bg-slate-50 border border-slate-100 rounded-3xl transition-all duration-300 hover:shadow-md hover:bg-white hover:border-indigo-100"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  mistake.type === 'language' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                }`}>
                  {mistake.type === 'language' ? 'Language Check' : 'Grammar Check'}
                </span>
                <span className="text-red-500 font-bold">-{mistake.pointsDeducted} pts</span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase mb-1">What you said</p>
                  <p className="text-slate-800 font-medium">"{mistake.originalText}"</p>
                </div>
                
                <div>
                  <p className="text-xs text-emerald-500 font-semibold uppercase mb-1">Corrected</p>
                  <p className="text-emerald-700 font-medium">{mistake.correctedText}</p>
                </div>

                <div className="pt-4 border-t border-slate-200/50">
                  <p className="text-slate-600 text-sm italic">"{mistake.feedback}"</p>
                </div>
              </div>
              
              <div className="mt-4 text-[10px] text-slate-400 font-medium text-right">
                {new Date(mistake.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MistakesPage;
