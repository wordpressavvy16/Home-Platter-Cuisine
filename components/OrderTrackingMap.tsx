import React from 'react';
import type { MealProvider, Order } from '../types';
import { KitchenIcon, HomeIcon, TruckIcon } from '../constants';

interface OrderTrackingMapProps {
  provider: MealProvider;
  order: Order;
}

const OrderTrackingMap: React.FC<OrderTrackingMapProps> = ({ provider, order }) => {
  if (!provider.coordinates || !order.tracking) {
    return (
      <div className="relative w-full h-[400px] bg-gray-200 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">Tracking information is not available.</p>
      </div>
    );
  }

  const { path, destination, currentLocation } = order.tracking;
  const start = provider.coordinates;
  const end = destination;

  // Convert path to an SVG polyline string
  const pathData = path.map(p => `${p.lng} ${p.lat}`).join(' ');

  return (
    <div className="relative w-full h-[400px] md:h-[500px] bg-gray-200 rounded-xl shadow-lg overflow-hidden border">
      {/* Simulated Map Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#d1d5db_1px,transparent_1px),linear-gradient(to_bottom,#d1d5db_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20"></div>

      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">
        {/* Delivery Path */}
        <polyline points={pathData} fill="none" stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="2 2" />
      </svg>
      
      {/* Provider Location */}
      <div className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center" style={{ top: `${start.lat}%`, left: `${start.lng}%` }}>
        <KitchenIcon className="w-8 h-8 text-green-700 drop-shadow-lg" />
        <span className="text-xs font-bold bg-white/70 px-1.5 py-0.5 rounded-md backdrop-blur-sm">{provider.name}</span>
      </div>

      {/* Customer Location */}
      <div className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center" style={{ top: `${end.lat}%`, left: `${end.lng}%` }}>
        <HomeIcon className="w-8 h-8 text-red-600 drop-shadow-lg" />
        <span className="text-xs font-bold bg-white/70 px-1.5 py-0.5 rounded-md backdrop-blur-sm">Your Location</span>
      </div>
      
      {/* Delivery Truck */}
      {currentLocation && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 linear" 
            style={{ top: `${currentLocation.lat}%`, left: `${currentLocation.lng}%` }}
          >
            <TruckIcon className="w-10 h-10 text-brand-dark drop-shadow-lg -rotate-45" />
        </div>
      )}

    </div>
  );
};

export default OrderTrackingMap;
