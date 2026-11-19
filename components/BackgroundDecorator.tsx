

import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { CrescentMoonAndStarIcon, DandiyaIcon, HangingLampIcon, LanternIcon, ModakIcon, SantaHatIcon, ChristmasBellsIcon } from '../constants';

const BackgroundDecorator: React.FC = () => {
    const { theme } = useTheme();
    const backgroundEffect = theme.decorations?.backgroundEffect;
    const sideDecoration = theme.decorations?.sideDecoration;

    if (!backgroundEffect && !sideDecoration) {
        return null;
    }

    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    let backgroundParticles: React.ReactNode = null;

    if (backgroundEffect === 'snowfall') {
        backgroundParticles = Array.from({ length: 50 }).map((_, i) => {
            const style = {
                '--tw-translate-x': `${random(-10, 100)}vw`,
                '--duration': `${random(15, 30)}s`,
                left: `${random(0, 100)}vw`,
                animationDelay: `${random(0, 30)}s`,
                opacity: random(0.3, 1),
                transform: `scale(${random(0.5, 1.2)})`,
            };
            return <div key={i} className="absolute top-0 rounded-full bg-white animate-snowfall" style={style}>❄️</div>;
        });
    }

    if (backgroundEffect === 'christmas-mix-fall') {
        const snowflakes = Array.from({ length: 50 }).map((_, i) => {
            const style = {
                '--tw-translate-x': `${random(-10, 100)}vw`,
                '--duration': `${random(15, 30)}s`,
                left: `${random(0, 100)}vw`,
                animationDelay: `${random(0, 30)}s`,
                opacity: random(0.3, 1),
                transform: `scale(${random(0.5, 1.2)})`,
            };
            return <div key={`snow-${i}`} className="absolute top-0 rounded-full bg-white animate-snowfall" style={style}>❄️</div>;
        });

        const festiveItems = Array.from({ length: 15 }).map((_, i) => {
            const style = {
                '--duration': `${random(12, 25)}s`,
                left: `${random(0, 100)}vw`,
                animationDelay: `${random(0, 25)}s`,
                opacity: random(0.7, 1),
                transform: `scale(${random(0.8, 1.3)})`,
            };
            let element;
            switch (i % 4) {
                case 0:
                    element = <SantaHatIcon className="w-8 h-8" />;
                    break;
                case 1:
                    element = <ChristmasBellsIcon className="w-8 h-8" />;
                    break;
                case 2:
                    element = <span className="text-2xl">🎄</span>;
                    break;
                case 3:
                    const ballColor = ['bg-red-500', 'bg-blue-500', 'bg-green-500'][i % 3];
                    element = <div className={`w-5 h-5 rounded-full ${ballColor} shadow-inner`}></div>;
                    break;
            }
            return <div key={`festive-${i}`} className="absolute top-0 animate-gentle-fall" style={style}>{element}</div>;
        });

        backgroundParticles = [...snowflakes, ...festiveItems];
    }
    
    if (backgroundEffect === 'diya') {
        const positions = [15, 30, 50, 70, 85]; // vw positions for symmetry
    
        // Top row of diyas
        const topDiyas = positions.map((pos, i) => {
            const style = {
                '--duration': `${random(5, 8)}s`,
                left: `${pos}vw`,
                top: '8rem',
                animationDelay: `${random(0, 5)}s`,
                transform: `translateX(-50%) scale(${random(0.8, 1.1)})`,
            };
            return <div key={`top-${i}`} className="absolute text-2xl animate-diya-float" style={style}>🪔</div>;
        });
    
        // Bottom row of diyas
        const bottomDiyas = positions.map((pos, i) => {
             const style = {
                '--duration': `${random(5, 8)}s`,
                left: `${pos}vw`,
                bottom: '10rem',
                animationDelay: `${random(0, 5)}s`,
                transform: `translateX(-50%) scale(${random(0.7, 1.0)})`,
            };
            return <div key={`bottom-${i}`} className="absolute text-2xl animate-diya-float" style={style}>🪔</div>;
        });
    
        backgroundParticles = [...topDiyas, ...bottomDiyas];
    }

    if (backgroundEffect === 'dandiya-fall') {
        backgroundParticles = Array.from({ length: 30 }).map((_, i) => {
            const style = {
                '--duration': `${random(12, 28)}s`,
                left: `${random(0, 100)}vw`,
                animationDelay: `${random(0, 28)}s`,
                opacity: random(0.6, 1),
                transform: `scale(${random(0.7, 1.2)})`,
            };
            const element = i % 3 === 0 ? <DandiyaIcon className="w-6 h-6" /> : <span className="text-xl">🌼</span>;
            return <div key={i} className="absolute top-0 animate-gentle-fall" style={style}>{element}</div>;
        });
    }
    
    if (backgroundEffect === 'ganesh-chaturthi-fall') {
        backgroundParticles = Array.from({ length: 30 }).map((_, i) => {
            const style = {
                '--duration': `${random(12, 28)}s`,
                left: `${random(0, 100)}vw`,
                animationDelay: `${random(0, 28)}s`,
                opacity: random(0.6, 1),
                transform: `scale(${random(0.7, 1.2)})`,
            };
            const element = i % 3 === 0 ? <ModakIcon className="w-6 h-6 text-yellow-600" /> : <span className="text-xl">🌺</span>;
            return <div key={i} className="absolute top-0 animate-gentle-fall" style={style}>{element}</div>;
        });
    }
    
    if (backgroundEffect === 'marigold-fall' || backgroundEffect === 'hibiscus-fall' || backgroundEffect === 'banana-leaf-fall' || backgroundEffect === 'sugarcane-fall') {
        backgroundParticles = Array.from({ length: 30 }).map((_, i) => {
            const style = {
                '--duration': `${random(10, 25)}s`,
                left: `${random(0, 100)}vw`,
                animationDelay: `${random(0, 25)}s`,
                opacity: random(0.5, 1),
                transform: `scale(${random(0.6, 1.2)})`,
            };
            let emoji = '🌼';
            if (backgroundEffect === 'hibiscus-fall') emoji = '🌺';
            if (backgroundEffect === 'banana-leaf-fall') emoji = '🌿';
            if (backgroundEffect === 'sugarcane-fall') emoji = '🎋';
            return <div key={i} className="absolute top-0 animate-gentle-fall text-xl" style={style}>{emoji}</div>;
        });
    }

    if (backgroundEffect === 'moon-and-stars') {
        backgroundParticles = Array.from({ length: 25 }).map((_, i) => {
            const style = {
                '--duration': `${random(15, 30)}s`,
                left: `${random(0, 100)}vw`,
                animationDelay: `${random(0, 30)}s`,
                opacity: random(0.4, 0.9),
                transform: `scale(${random(0.5, 1)})`,
            };
            return <div key={i} className="absolute top-0 animate-crescent-star-fall w-6 h-6" style={style}><CrescentMoonAndStarIcon className="w-full h-full drop-shadow-lg" /></div>;
        });
    }

    if (backgroundEffect === 'lantern-fall') {
        backgroundParticles = Array.from({ length: 25 }).map((_, i) => {
            const style = {
                '--duration': `${random(15, 30)}s`,
                left: `${random(0, 100)}vw`,
                animationDelay: `${random(0, 30)}s`,
                opacity: random(0.4, 0.9),
                transform: `scale(${random(0.6, 1.1)})`,
            };
            return <div key={i} className="absolute top-0 animate-crescent-star-fall w-8 h-8" style={style}><LanternIcon className="text-amber-400 w-full h-full drop-shadow-lg" /></div>;
        });
    }

    if (backgroundEffect === 'sun-pulse') {
        backgroundParticles = Array.from({ length: 15 }).map((_, i) => {
             const style = {
                '--duration': `${random(4, 8)}s`,
                left: `${random(5, 95)}vw`,
                top: `${random(10, 80)}vh`,
                animationDelay: `${random(0, 8)}s`,
                transform: `scale(${random(0.3, 0.8)})`,
            };
            return <div key={i} className="absolute text-3xl animate-sun-pulse" style={style}>☀️</div>;
        });
    }

    let sideElement: React.ReactNode = null;
    if (sideDecoration === 'hanging-lamp') {
        sideElement = (
            <>
                {/* Left Trio */}
                <div className="absolute top-0 left-[12%] -translate-x-1/2 w-10 h-[150px] pointer-events-none origin-top animate-gentle-sway">
                    <HangingLampIcon className="w-full h-full" />
                </div>
                <div className="absolute top-0 left-[calc(12%-35px)] -translate-x-1/2 w-10 h-[120px] pointer-events-none origin-top animate-gentle-sway" style={{ animationDelay: '0.3s' }}>
                    <HangingLampIcon className="w-full h-full" />
                </div>
                <div className="absolute top-0 left-[calc(12%+35px)] -translate-x-1/2 w-10 h-[120px] pointer-events-none origin-top animate-gentle-sway" style={{ animationDelay: '0.6s' }}>
                    <HangingLampIcon className="w-full h-full" />
                </div>

                {/* Right Trio */}
                <div className="absolute top-0 right-[12%] translate-x-1/2 w-10 h-[150px] pointer-events-none origin-top animate-gentle-sway">
                    <HangingLampIcon className="w-full h-full" />
                </div>
                <div className="absolute top-0 right-[calc(12%+35px)] translate-x-1/2 w-10 h-[120px] pointer-events-none origin-top animate-gentle-sway" style={{ animationDelay: '0.3s' }}>
                    <HangingLampIcon className="w-full h-full" />
                </div>
                <div className="absolute top-0 right-[calc(12%-35px)] translate-x-1/2 w-10 h-[120px] pointer-events-none origin-top animate-gentle-sway" style={{ animationDelay: '0.6s' }}>
                    <HangingLampIcon className="w-full h-full" />
                </div>
            </>
        );
    }
    
    if (sideDecoration === 'hanging-lanterns') {
        const lanternStyle = "w-12 h-12 text-amber-400 drop-shadow-lg";
        sideElement = (
            <>
                {/* Left Lantern */}
                <div className="absolute top-0 left-4 w-12 h-40 pointer-events-none origin-top animate-gentle-sway" style={{ animationDelay: '0.5s' }}>
                    <svg viewBox="0 0 24 24" className="absolute top-0 left-0 w-full h-1/2" fill="none">
                        <path d="M12 0 V 24" stroke="#854d0e" strokeWidth="1" />
                    </svg>
                    <div className="absolute bottom-0 left-0 w-full h-1/2">
                         <LanternIcon className={lanternStyle} />
                    </div>
                </div>
                 {/* Right Lantern */}
                <div className="absolute top-0 right-4 w-12 h-40 pointer-events-none origin-top animate-gentle-sway">
                     <svg viewBox="0 0 24 24" className="absolute top-0 left-0 w-full h-1/2" fill="none">
                        <path d="M12 0 V 24" stroke="#854d0e" strokeWidth="1" />
                    </svg>
                    <div className="absolute bottom-0 left-0 w-full h-1/2">
                         <LanternIcon className={lanternStyle} />
                    </div>
                </div>
            </>
        );
    }
    
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
            {backgroundParticles}
            {sideElement}
        </div>
    );
};

export default BackgroundDecorator;