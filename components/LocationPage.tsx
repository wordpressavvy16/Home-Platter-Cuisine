import React, { useState } from 'react';
import { LocationPinIcon } from '../constants';
import Loader from './Loader';

interface LocationPageProps {
    onLocationSet: (locationData: { lat?: number; lng?: number; address?: string }) => void;
    navigate: (path: string, params?: Record<string, any>) => void;
}

const LocationPage: React.FC<LocationPageProps> = ({ onLocationSet, navigate }) => {
    const [manualLocation, setManualLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }
        setIsLoading(true);
        setError('');
        // This function now correctly contains the permission request,
        // ensuring it only runs on user interaction.
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setIsLoading(false);
                onLocationSet({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            () => {
                setIsLoading(false);
                setError('Unable to retrieve your location. Please enable location services or enter your address manually.');
            }
        );
    };

    const handleFindTiffins = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualLocation.trim()) {
            setError('Please enter a location.');
            return;
        }
        setIsLoading(true);
        setError('');
        // Simulate a geocoding lookup
        setTimeout(() => {
            setIsLoading(false);
            onLocationSet({ address: manualLocation });
        }, 500);
    };

    const handleSkip = () => {
        // Pass an empty object to signify skipping the location step.
        onLocationSet({});
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-lg relative">
                <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">&larr; Back</button>
                <h1 className="text-3xl font-bold font-serif text-brand-dark mb-2 mt-8">Set Your Delivery Location</h1>
                <p className="text-gray-600 mb-8">Find delicious homemade meals near you.</p>

                <button
                    onClick={handleUseCurrentLocation}
                    disabled={isLoading}
                    className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl text-lg transition hover:opacity-90 flex items-center justify-center gap-2 animate-press"
                >
                    <LocationPinIcon className="w-6 h-6" />
                    Use my current location
                </button>

                <div className="my-6 flex items-center">
                    <hr className="flex-grow border-gray-300" />
                    <span className="px-4 text-gray-500 font-semibold">Or</span>
                    <hr className="flex-grow border-gray-300" />
                </div>

                <form onSubmit={handleFindTiffins} className="space-y-4">
                    <input
                        type="text"
                        value={manualLocation}
                        onChange={(e) => setManualLocation(e.target.value)}
                        placeholder="Enter your street, area, or city"
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gray-700 text-white font-bold py-4 rounded-xl text-lg transition hover:bg-gray-800 disabled:bg-gray-400"
                    >
                        {isLoading ? <Loader text="Finding..." /> : 'Find Tiffins'}
                    </button>
                </form>

                <button
                    onClick={handleSkip}
                    disabled={isLoading}
                    className="mt-6 text-gray-500 font-semibold hover:text-brand-primary transition"
                >
                    Skip for now
                </button>

                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            </div>
        </div>
    );
};

export default LocationPage;