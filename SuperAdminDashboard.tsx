import React from 'react';
import type { Theme } from './themes';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { BackArrowIcon, SparklesIcon } from './constants';
import ProviderManagementPanel from './components/ProviderManagementPanel'; 
import SuperAdminKpiPanel from './components/SuperAdminKpiPanel';
import SuperAdminCrmPanel from './components/SuperAdminCrmPanel';
import ProviderInvoicingPanel from './components/ProviderInvoicingPanel';
import SuperAdminSupportPanel from './components/SuperAdminSupportPanel';
import ReviewModerationPanel from './components/ReviewModerationPanel';
import ProviderQualityPanel from './components/ProviderQualityPanel';
import DisputeResolutionPanel from './components/DisputeResolutionPanel';
import Loader from './components/Loader';

interface SuperAdminDashboardProps {
    navigate: (path: string) => void;
}

const CheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.06-1.06L11.25 12.69l-1.78-1.78a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l5.25-5.25z" clipRule="evenodd" />
    </svg>
);

interface ThemeCardProps {
    theme: Theme;
    isActive: boolean;
    onSelect: (themeName: string) => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isActive, onSelect }) => {
    const hasDecorations = !!theme.decorations;
    return (
        <div className={`rounded-xl shadow-lg border-4 ${isActive ? 'border-brand-primary' : 'border-transparent'} overflow-hidden transition-all transform hover:-translate-y-1.5`}>
            <div className="p-6 bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{theme.name}</h3>
                    {hasDecorations && (
                        <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full" title="This theme includes special animations">
                            <SparklesIcon className="w-4 h-4" />
                            <span>Special</span>
                        </div>
                    )}
                </div>
                <div className="flex space-x-2">
                    {Object.entries(theme.colors).map(([name, color]) => (
                         <div key={name} title={name} className="w-8 h-8 rounded-full shadow-inner" style={{ backgroundColor: color }}></div>
                    ))}
                </div>
            </div>
            <button 
                onClick={() => onSelect(theme.name)} 
                disabled={isActive}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 transition-colors disabled:bg-brand-light disabled:text-brand-dark flex items-center justify-center gap-2"
            >
                {isActive ? <><CheckIcon className="w-6 h-6"/> Active Theme</> : 'Apply Theme'}
            </button>
        </div>
    )
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ navigate }) => {
    const { themes, theme: activeTheme, setTheme } = useTheme();
    const { isLoading: isAuthLoading, token } = useAuth();

    if (isAuthLoading || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader text="Loading Admin Dashboard..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-black/10 transition-colors">
                        <BackArrowIcon className="w-6 h-6 text-text" />
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-text font-serif">
                            Super Admin Dashboard
                        </h1>
                        <p className="text-text/80">Platform-wide management tools.</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* KPI Panel */}
                    <SuperAdminKpiPanel />

                    {/* New Dispute Resolution Panel */}
                    <div>
                        <DisputeResolutionPanel />
                    </div>

                    {/* New Review Moderation Panel */}
                    <ReviewModerationPanel />

                    {/* New Provider Quality Panel */}
                    <ProviderQualityPanel />

                    {/* Provider Management Panel */}
                    <ProviderManagementPanel />

                    {/* New Invoicing Panel */}
                    <ProviderInvoicingPanel />
                    
                    {/* Master CRM Panel */}
                    <SuperAdminCrmPanel navigate={navigate} />

                    {/* New Support Ticket Panel */}
                    <SuperAdminSupportPanel />

                    {/* Theming Panel */}
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-text mb-1">Dynamic Platform Theming</h2>
                        <p className="text-text/70 mb-6">Select a theme to instantly change the visual appearance of the entire application for all users. Useful for promotions or seasonal events.</p>
                    
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {themes.map(t => (
                                <ThemeCard 
                                    key={t.name}
                                    theme={t}
                                    isActive={t.name === activeTheme.name}
                                    onSelect={setTheme}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;