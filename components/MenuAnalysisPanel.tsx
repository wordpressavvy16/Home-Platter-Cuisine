import React, { useState, useCallback } from 'react';
import { analyzeMenu } from '../services/geminiService';
import type { Meal, MenuAnalysis } from '../types';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';
import { LightbulbIcon, SparklesIcon, ThumbsUpIcon } from '../constants';

interface MenuAnalysisPanelProps {
  menu: Meal[];
}

const MenuAnalysisPanel: React.FC<MenuAnalysisPanelProps> = ({ menu }) => {
  const { token } = useAuth();
  const [analysis, setAnalysis] = useState<MenuAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyzeMenu = useCallback(async () => {
    if (!token) {
        setError("Authentication required to perform analysis.");
        return;
    }
    setIsLoading(true);
    setError('');
    setAnalysis(null);
    try {
      const result = await analyzeMenu(menu, token);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  }, [menu, token]);

  const hasEnoughData = menu.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-full">
            <LightbulbIcon className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              AI Menu Optimization
            </h2>
            <p className="text-gray-500">Get AI-driven advice to improve your menu.</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        {isLoading ? (
          <Loader text="Analyzing your menu... this may take a moment." />
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : analysis ? (
          <div className="animate-fade-in space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                       <ThumbsUpIcon className="w-6 h-6 text-green-500" />
                       <h3 className="font-bold text-lg text-gray-700">Strengths</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                        {analysis.strengths.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
                <div>
                     <div className="flex items-center gap-2 mb-2">
                       <SparklesIcon className="w-6 h-6 text-blue-500" />
                       <h3 className="font-bold text-lg text-gray-700">Opportunities</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                        {analysis.opportunities.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
            </div>
             <div>
                <h3 className="font-bold text-lg text-gray-700 mt-4 mb-2">Pricing Analysis</h3>
                <p className="text-gray-600 text-sm italic">"{analysis.pricingAnalysis}"</p>
            </div>
            <div>
                <h3 className="font-bold text-lg text-gray-700 mt-4 mb-2">Description Analysis</h3>
                <p className="text-gray-600 text-sm italic">"{analysis.descriptionAnalysis}"</p>
            </div>
             <div className="text-center mt-6">
                <button 
                    onClick={() => setAnalysis(null)}
                    className="text-sm font-semibold text-yellow-600 hover:underline"
                >
                    Analyze Again
                </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <button
              onClick={handleAnalyzeMenu}
              disabled={!hasEnoughData || !token}
              className="bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {hasEnoughData ? 'Analyze My Menu' : `Add items to your menu to enable analysis`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuAnalysisPanel;
