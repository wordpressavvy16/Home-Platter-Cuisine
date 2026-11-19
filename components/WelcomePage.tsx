import React, { useState } from 'react';
import { KitchenIcon, SparklesIcon, TruckIcon } from '../constants';

interface WelcomePageProps {
    navigate: (path: string, params?: Record<string, any>) => void;
}

const FeatureHighlight: React.FC<{ Icon: React.FC<{className?: string}>, title: string, description: string }> = ({ Icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="bg-white/20 p-3 rounded-xl">
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-white/80">{description}</p>
        </div>
    </div>
);

const WelcomePage: React.FC<WelcomePageProps> = ({ navigate }) => {
    const [imgFailed, setImgFailed] = useState(false);

    return (
        <div className="relative min-h-screen flex flex-col bg-brand-dark text-white overflow-hidden">
            {/* Full-bleed Cuisines Curated at Home Background Layer (Mobile/Tablet Launch View) */}
            <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
                {!imgFailed && (
                    <img
                        src="/cuisines-curated-home-bg.jpg"
                        alt="Authentic homemade cuisines curated at home"
                        referrerPolicy="no-referrer"
                        onError={() => setImgFailed(true)}
                        className="w-full h-full object-cover object-center opacity-50"
                    />
                )}
                {/* Project theme ambient color integration */}
                <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-brand-primary opacity-20 blur-3xl" />
                <div className="absolute bottom-16 -right-24 w-80 h-80 rounded-full bg-brand-secondary opacity-15 blur-3xl" />
                {/* Measured contrast scrim for crisp foreground legibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/85" />
            </div>

            <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-bold font-serif leading-tight">
                        Tiffin Time
                    </h1>
                    <p className="text-xl md:text-2xl mt-4 text-white/90">
                        Your Daily Dose of Homemade Happiness
                    </p>

                    <div className="mt-12 space-y-8 text-left">
                        <FeatureHighlight 
                            Icon={KitchenIcon}
                            title="Homemade Goodness"
                            description="Discover delicious, authentic home-cooked meals from local chefs."
                        />
                         <FeatureHighlight 
                            Icon={SparklesIcon}
                            title="Local & Fresh"
                            description="Freshly prepared using local ingredients and delivered to your doorstep."
                        />
                         <FeatureHighlight 
                            Icon={TruckIcon}
                            title="Easy Delivery"
                            description="Perfect for students, professionals, and anyone craving a taste of home."
                        />
                    </div>
                </div>
            </div>
            
            <div className="relative z-10 p-6 bg-black/20 backdrop-blur-sm">
                <div className="max-w-md mx-auto space-y-4">
                    <button
                        onClick={() => navigate('/auth', { mode: 'signup' })}
                        className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl text-lg transition hover:opacity-90 animate-press"
                    >
                        Sign Up
                    </button>
                    <button
                        onClick={() => navigate('/auth', { mode: 'login' })}
                        className="w-full bg-white/20 text-white font-bold py-4 rounded-xl text-lg transition hover:bg-white/30"
                    >
                        Log In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;