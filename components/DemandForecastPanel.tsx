import React, { useState, useCallback } from 'react';
import { forecastDemand } from '../services/geminiService';
import type { Order, Meal, DemandForecastResult } from '../types';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';
import { TrendingUpIcon } from '../constants';

interface DemandForecastPanelProps {
  orders: Order[];
  menu: Meal[];
}

const DemandForecastPanel: React.FC<DemandForecastPanelProps> = ({ orders, menu }) => {
  const { token } = useAuth();
  const [forecast, setForecast] = useState<DemandForecastResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const minOrdersForForecast = 5;

  const handleForecast = useCallback(async () => {
    if (!token) {
        setError("Authentication required to perform forecast.");
        return;
    }
    setIsLoading(true);
    setError('');
    setForecast(null);
    try {
      const result = await forecastDemand(orders, menu, token);
      setForecast(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during forecast.');
    } finally {
      setIsLoading(false);
    }
  }, [orders, menu, token]);

  const hasEnoughData = orders.length >= minOrdersForForecast;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            <TrendingUpIcon className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              AI Demand Forecast
            </h2>
            <p className="text-gray-500">Predict which items will be popular next week.</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        {isLoading ? (
          <Loader text="Forecasting demand... this may take a moment." />
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : forecast ? (
          <div className="animate-fade-in space-y-4">
            <h3 className="font-bold text-lg text-gray-700">
              Forecast for: <span className="text-green-700">{forecast.forecastPeriod}</span>
            </h3>
            <ul className="space-y-3">
              {forecast.predictedItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                   <div className="flex-shrink-0 bg-green-200 text-green-800 font-bold rounded-full h-6 w-6 flex items-center justify-center text-sm">{i+1}</div>
                   <div>
                       <p className="font-semibold text-gray-800">{item.itemName}</p>
                       <p className="text-sm text-gray-600">{item.reason}</p>
                   </div>
                </li>
              ))}
            </ul>
             <div className="text-center mt-6">
                <button 
                    onClick={() => setForecast(null)}
                    className="text-sm font-semibold text-green-600 hover:underline"
                >
                    Run Forecast Again
                </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <button
              onClick={handleForecast}
              disabled={!hasEnoughData || !token}
              className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {hasEnoughData ? 'Forecast Next Week\'s Demand' : `Need at least ${minOrdersForForecast} orders`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemandForecastPanel;
