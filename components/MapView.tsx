import React, { useState } from 'react';
import type { MealProvider } from '../types';
import { LocationPinIcon, StarIcon } from '../constants';

interface MapViewProps {
  providers: MealProvider[];
  onSelectProvider: (provider: MealProvider) => void;
}

const MapView: React.FC<MapViewProps> = ({ providers, onSelectProvider }) => {
  const [selectedProvider, setSelectedProvider] = useState<MealProvider | null>(null);

  const handlePinClick = (provider: MealProvider) => {
    setSelectedProvider(provider);
  };

  return (
    <div className="relative w-full h-[600px] bg-gray-200 rounded-xl shadow-lg overflow-hidden border">
      {/* Simulated Map Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#d1d5db_1px,transparent_1px),linear-gradient(to_bottom,#d1d5db_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20"></div>
      
      {providers.map(provider => {
        if (!provider.coordinates) return null;

        const isSelected = selectedProvider?.id === provider.id;

        return (
          <button
            key={provider.id}
            onClick={() => handlePinClick(provider)}
            className="absolute -translate-x-1/2 -translate-y-full transform transition-transform duration-300 hover:scale-125 focus:outline-none z-10"
            style={{
              top: `${provider.coordinates.lat}%`,
              left: `${provider.coordinates.lng}%`,
              zIndex: isSelected ? 30 : 10,
            }}
            aria-label={`View ${provider.name}`}
          >
            <LocationPinIcon className={`w-10 h-10 drop-shadow-lg transition-colors ${isSelected ? 'text-brand-primary' : 'text-gray-700'}`} />
          </button>
        );
      })}

      {/* Info Window for Selected Provider */}
      {selectedProvider && selectedProvider.coordinates && (
        <div
          className="absolute bg-white rounded-lg shadow-2xl w-64 p-3 z-20 animate-fade-in"
          style={{
            top: `${selectedProvider.coordinates.lat}%`,
            left: `${selectedProvider.coordinates.lng}%`,
            transform: 'translate(20px, -110%)',
          }}
        >
          <div className="flex items-start gap-3">
            <img src={selectedProvider.profileImageUrl} alt={selectedProvider.name} className="w-16 h-16 rounded-md object-cover"/>
            <div className="flex-grow">
              <h4 className="font-bold text-gray-800 text-base">{selectedProvider.name}</h4>
              <p className="text-sm text-gray-500">{selectedProvider.cuisine}</p>
              <div className="flex items-center gap-1 text-sm mt-1">
                <StarIcon className="w-4 h-4 text-yellow-400"/>
                <span className="font-semibold">{selectedProvider.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectProvider(selectedProvider)}
            className="w-full mt-3 bg-brand-primary text-white text-sm font-semibold py-2 rounded-md hover:bg-brand-dark transition-colors"
          >
            View Kitchen
          </button>
        </div>
      )}
    </div>
  );
};

export default MapView;
