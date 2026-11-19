import React from 'react';
import type { Badge } from './types';

// --- Application-wide Constants ---
export const LOYALTY_POINT_VALUE = 0.1; // 1 point = ₹0.10
export const MIN_REVIEWS_FOR_SUMMARY = 2;


// --- New Catering Constants for Story 2.18 ---
export const CATERING_EVENT_TYPES = [
    { id: 'birthday', label: 'Birthday Parties' },
    { id: 'corporate', label: 'Corporate Events' },
    { id: 'wedding', label: 'Weddings & Anniversaries' },
    { id: 'private', label: 'Private Dinners' },
    { id: 'festival', label: 'Festivals & Holidays' },
];

// --- New Dietary & Allergen Constants for Story 2.15 ---
export const DIETARY_OPTIONS = [
    { id: 'vegan', label: 'Vegan', description: 'Contains no animal products.' },
    { id: 'gluten-free', label: 'Gluten-Free', description: 'Does not contain gluten.' },
    { id: 'keto', label: 'Keto-Friendly', description: 'Low in carbohydrates.' },
    { id: 'low-fat', label: 'Low-Fat', description: 'Low in fat content.' },
];

export const ALLERGEN_OPTIONS = [
    { id: 'nuts', label: 'Contains Nuts', description: 'Contains peanuts or tree nuts.' },
    { id: 'dairy', label: 'Contains Dairy', description: 'Contains milk or milk products.' },
    { id: 'soy', label: 'Contains Soy', description: 'Contains soy or soy products.' },
    { id: 'shellfish', label: 'Contains Shellfish', description: 'Contains crustacean shellfish.' },
];




// --- New Icons for Dietary & Allergen Tags ---

export const LeafIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM3.44 3.44a6.5 6.5 0 019.192 11.053.75.75 0 00-1.06-1.06A5 5 0 005.56 5.56a.75.75 0 00-1.06 1.06A6.503 6.503 0 012.63 4.5a.75.75 0 00-1.061-1.06z" />
      <path d="M10 18a.75.75 0 00.75-.75V8.196a3.738 3.738 0 01-1.5 0V17.25A.75.75 0 0010 18zM15.4 5.748a1.5 1.5 0 00-2.378 1.052.75.75 0 00.818.818C15.4 7.38 16.5 6.226 16.5 5.748a1.5 1.5 0 00-1.1-1.44z" />
    </svg>
);

export const GlutenFreeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 21.75l-4.22-4.22a2.25 2.25 0 010-3.18l8.44-8.44a2.25 2.25 0 013.18 0l4.22 4.22a2.25 2.25 0 010 3.18l-8.44 8.44a2.25 2.25 0 01-3.18 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 14.25c.373 0 .743.03 1.11.088m-1.11-.088c-.373 0-.743-.03-1.11-.088m1.11.088c.373 0 .743.03 1.11.088m-1.11-.088l-.042.167a.45.45 0 00.208.514l3.05 1.525a.45.45 0 00.514-.208l.167-.042m-4.041-1.903c.373 0 .743-.03 1.11-.088m-1.11.088c-.373 0-.743.03-1.11-.088m1.11.088c.373 0 .743.03 1.11.088m-1.11-.088l.042-.167a.45.45 0 01.208-.514l3.05-1.525a.45.45 0 01.514.208l.167.042" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21L3 3" />
    </svg>
);

export const NutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.863 3.655c-.563-.26-1.177-.26-1.74 0C9.69 4.341 8.25 6.522 8.25 9c0 2.25 1.259 4.237 3.003 5.378a.75.75 0 01.494 0c1.744-1.14 3.003-3.128 3.003-5.378 0-2.478-1.44-4.659-2.887-5.345z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9c0-2.478-1.44-4.659-2.887-5.345" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z" />
    </svg>
);

export const DairyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5c-1.336 0-2.5 .3-3.5 1.5-.9 1.2-.5 3.3.3 4.5l3.2 3.9 3.2-3.9c.8-1.2 1.2-3.3.3-4.5-1-1.2-2.164-1.5-3.5-1.5z" />
    </svg>
);


export const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434L10.788 3.21z" clipRule="evenodd" />
  </svg>
);

export const LocationPinIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a2.25 2.25 0 001.287-2.074V8.75a2.25 2.25 0 00-2.25-2.25H9.75a2.25 2.25 0 00-2.25 2.25v11.528c0 .855.485 1.626 1.287 2.074zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
    </svg>
);

export const BackArrowIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

export const VegIcon = ({ className }: { className?: string }) => (
  <div className={`border-2 border-green-600 w-5 h-5 flex items-center justify-center ${className}`}>
    <div className="bg-green-600 w-2.5 h-2.5 rounded-full"></div>
  </div>
);

export const NonVegIcon = ({ className }: { className?: string }) => (
  <div className={`border-2 border-red-600 w-5 h-5 flex items-center justify-center ${className}`}>
    <div className="bg-red-600 w-2.5 h-2.5 rounded-full"></div>
  </div>
);

export const UserIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

export const PencilIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 19.07a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
);

export const PlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export const TrashIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.134H8.09a2.09 2.09 0 00-2.09 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

export const FeedbackIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const CrmIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962A3.75 3.75 0 0115 9.75v.008c0 .022.012.042.013.064l.008.054c.018.12.03.24.042.358a4.5 4.5 0 01-2.96 1.486A2.25 2.25 0 0112 15a2.25 2.25 0 01-1.054-.282A4.5 4.5 0 019 12.064l.008-.054c.002-.022.014-.042.014-.064v-.008A3.75 3.75 0 0112 6.75v.008c.022 0 .042.012.064.013l.054.008c.12.018.24.03.358.042m-4.524 2.818A3.75 3.75 0 006.75 9.75v.008c0 .022.012.042.013.064l.008.054c.018.12.03.24.042.358a4.5 4.5 0 002.96 1.486A2.25 2.25 0 009 15a2.25 2.25 0 001.054-.282m2.936-1.422a4.5 4.5 0 00-2.96-1.486" />
    </svg>
);

export const KitchenIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636l1.5-2.821L12 3m6.75 18v-3.375c0-.621-.504-1.125-1.125-1.125h-2.25c-.621 0-1.125.504-1.125 1.125V21" />
    </svg>
);

export const MenuIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 015.25 6h.008a2.25 2.25 0 012.242 2.135 48.425 48.425 0 00.1 1.071 2.25 2.25 0 01-2.242 2.135H5.25a2.25 2.25 0 01-2.25-2.25V6.75a2.25 2.25 0 012.25-2.25h9.528c1.135 0 2.098.845 2.192 1.976.043.336.065.68.08 1.123m-1.123 0h-5.801" />
    </svg>
);

export const ThumbsUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M6.633 10.5l-1.87-1.87a.75.75 0 00-1.06 1.06L5.573 10.5m0 0a2.25 2.25 0 012.25 2.25v5.25a2.25 2.25 0 01-2.25-2.25H4.874a2.25 2.25 0 01-2.25-2.25v-5.25a2.25 2.25 0 012.25-2.25h1.759z" />
    </svg>
);

export const ThumbsDownIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5H5.904m1.125 0a2.25 2.25 0 00-2.25-2.25v-5.25a2.25 2.25 0 00-2.25-2.25H4.874a2.25 2.25 0 00-2.25 2.25v5.25a2.25 2.25 0 002.25 2.25m1.125 0l1.87 1.87a.75.75 0 001.06-1.06L6.633 10.5m0 0c.806 0 1.533.446 2.031 1.08a9.041 9.041 0 002.861 2.4c.723.384 1.35.956 1.653 1.715a4.498 4.498 0 00.322 1.672v2.75a.75.75 0 00.75.75A2.25 2.25 0 0016.5 21c0-1.152-.26-2.243-.723-3.218-.266-.558.107-1.282.725-1.282h3.126c1.026 0 1.945-.694 2.054-1.715.045-.422.068.85.068 1.285a11.95 11.95 0 00-2.649-7.521c-.388-.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114 1.04a4.501 4.501 0 00-1.423.23z" />
    </svg>
);


export const LightbulbIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a.75.75 0 01-1.5 0c-1.38 0-2.397-1.127-2.612-2.524a.75.75 0 01.455-.832A12.061 12.061 0 0112 6.498a12.061 12.061 0 013.658 2.62c.311.23.455.632.455.832-.216 1.397-1.232 2.524-2.612 2.524a.75.75 0 01-1.5 0z" />
    </svg>
);

export const AnalyticsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

export const CurrencyDollarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182.553-.44 1.278-.659 2.003-.659c.725 0 1.45.22 2.003.659m-4.5 6.458l-1.99-1.5a1.5 1.5 0 010-2.4l1.99-1.5m6.458 6.458l1.99-1.5a1.5 1.5 0 000-2.4l-1.99-1.5" />
    </svg>
);

export const ShoppingCartIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.328 1.093-.822l-1.543-8.823A.875.875 0 0014.25 3H6.375a.875.875 0 00-.865.696L4.563 12.75M7.5 14.25L5.106 5.165m0 0a.875.875 0 01.865-.696h8.875a.875.875 0 01.865.696M7.5 14.25L7.5 19.5" />
    </svg>
);

export const SparklesIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.575L16.5 21.75l-.398-1.175a3.375 3.375 0 00-2.312-2.312L12 18l1.175-.398a3.375 3.375 0 002.312-2.312L16.5 14.25l.398 1.175a3.375 3.375 0 002.312 2.312L20.25 18l-1.175.398a3.375 3.375 0 00-2.312 2.312z" />
    </svg>
);

export const CogIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5M12 15.75a3.75 3.75 0 110-7.5 3.75 3.75 0 010 7.5z" />
    </svg>
);

export const CreditCardIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
);

export const UsersIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962A3.75 3.75 0 0115 9.75v.008c0 .022.012.042.013.064l.008.054c.018.12.03.24.042.358a4.5 4.5 0 01-2.96 1.486A2.25 2.25 0 0112 15a2.25 2.25 0 01-1.054-.282A4.5 4.5 0 019 12.064l.008-.054c.002-.022.014-.042.014-.064v-.008A3.75 3.75 0 0112 6.75v.008c.022 0 .042.012.064.013l.054.008c.12.018.24.03.358.042m-4.524 2.818A3.75 3.75 0 006.75 9.75v.008c0 .022.012.042.013.064l.008.054c.018.12.03.24.042.358a4.5 4.5 0 002.96 1.486A2.25 2.25 0 009 15a2.25 2.25 0 001.054-.282m2.936-1.422a4.5 4.5 0 00-2.96-1.486" />
    </svg>
);

export const ShieldCheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
    </svg>
);

export const ShieldExclamationIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.007H12v-.007z" />
    </svg>
);

export const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.007H12v-.007z" />
    </svg>
);

// FIX: Add missing CalendarDaysIcon used in ProfilePage and SubscriptionManagementPanel.
export const CalendarDaysIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" />
    </svg>
);

// FIX: Add missing icons used across various components.
export const ShareIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.05.588.08a2.25 2.25 0 011.632 3.003l-3.376 6.752a2.25 2.25 0 01-4.247-.618l-3.376-6.752a2.25 2.25 0 011.632-3.003c.198-.03.393-.055.588-.08zM15.75 9a2.25 2.25 0 100 2.186m0-2.186c-.195.025-.39.05-.588.08a2.25 2.25 0 00-1.632 3.003l3.376 6.752a2.25 2.25 0 004.247-.618l3.376-6.752a2.25 2.25 0 00-1.632-3.003c-.198-.03-.393-.055-.588-.08z" />
    </svg>
);

export const QuestionMarkCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
);

export const FunnelIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.012L9.75 21v-6.572a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
);

export const MapIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-6.75 4.496-1.874a.75.75 0 01.997.747v10.5a.75.75 0 01-.997.747L15 15.75m-6-9L3.504 4.875a.75.75 0 00-.997.747v10.5a.75.75 0 00.997.747L9 15.75" />
    </svg>
);

export const ListBulletIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

export const GiftIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A3.75 3.75 0 006.75 8.625h10.5A3.75 3.75 0 0012 4.875zM12 11.25a3.75 3.75 0 013.75 3.75v3.75a1.5 1.5 0 01-1.5 1.5h-4.5a1.5 1.5 0 01-1.5-1.5v-3.75A3.75 3.75 0 0112 11.25z" />
    </svg>
);

export const TrendingUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.75-.625m3.75.625V3.375" />
    </svg>
);

export const BellIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

export const ChatBubbleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a1.125 1.125 0 01-1.59 0l-3.72-3.72c-1.133-.093-1.98-1.057-1.98-2.193V10.608c0-.97.616-1.813 1.5-2.097m6.75-3.686l-6.75 3.686m6.75-3.686l-1.5 6.656M3 12l6.75 3.686" />
    </svg>
);

export const ChatBubbleLeftRightIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.25c.621 0 1.125.504 1.125 1.125v4.25c0 .621-.504 1.125-1.125 1.125H18a1.125 1.125 0 01-1.125-1.125v-4.25c0-.621.504-1.125 1.125-1.125h2.25zM3.75 8.25c.621 0 1.125.504 1.125 1.125v4.25c0 .621-.504 1.125-1.125 1.125H6a1.125 1.125 0 01-1.125-1.125v-4.25c0-.621.504-1.125 1.125-1.125h-2.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.258V6.26m0 0L8.25 3.507M12 6.26l3.75-2.753" />
    </svg>
);


export const PaperAirplaneIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);

export const XMarkIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const RobotIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
);

export const CameraIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
);

export const ImageUploadIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

export const MegaphoneIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 1.87c.18-.686.843-1.143 1.546-1.143h.228c.703 0 1.366.457 1.546 1.143l.102.388a1.5 1.5 0 001.294 1.294l.388.102c.686.18 1.143.843 1.143 1.546v.228c0 .703-.457 1.366-1.143 1.546l-.388.102a1.5 1.5 0 00-1.294 1.294l-.102.388c-.18.686-.843 1.143-1.546 1.143h-.228c-.703 0-1.366-.457-1.546-1.143l-.102-.388a1.5 1.5 0 00-1.294-1.294l-.388-.102c-.686-.18-1.143-.843-1.143-1.546v-.228c0 .703.457-1.366 1.143-1.546l.388-.102a1.5 1.5 0 001.294-1.294l.102-.388zM14.25 7.5a.75.75 0 000 1.5h3.75a.75.75 0 000-1.5h-3.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM10.5 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 5.25v-.625a1.125 1.125 0 00-1.125-1.125H10.5a1.125 1.125 0 00-1.125 1.125v.625" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 18.75v.625a1.125 1.125 0 01-1.125 1.125H10.5a1.125 1.125 0 01-1.125-1.125v-.625" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 11.25h.625a1.125 1.125 0 011.125 1.125v1.125a1.125 1.125 0 01-1.125 1.125h-.625" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 11.25h-.625a1.125 1.125 0 00-1.125 1.125v1.125a1.125 1.125 0 001.125 1.125h.625" />
    </svg>
);

export const DocumentTextIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

export const HomeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

export const ReceiptPercentIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
    </svg>
);

export const FireIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.052A9.75 9.75 0 0110.5 18c0-5.523 4.477-10 10-10a.75.75 0 000-1.5 11.25 11.25 0 00-7.537-2.714zM12 6a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-1.5 0A6.75 6.75 0 0012 6z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M12 21a.75.75 0 01-.75-.75V18a.75.75 0 011.5 0v2.25A.75.75 0 0112 21zM9.75 15.75A.75.75 0 019 15V9.75a.75.75 0 011.5 0v5.25a.75.75 0 01-.75.75zM14.25 15.75a.75.75 0 01-.75-.75V12a.75.75 0 011.5 0v3a.75.75 0 01-.75.75zM5.25 18A.75.75 0 014.5 17.25V9.75a.75.75 0 011.5 0v7.5A.75.75 0 015.25 18z" clipRule="evenodd" />
    </svg>
);

export const TruckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path d="M9 6.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75h-.75a.75.75 0 01-.75-.75V6.75z" />
        <path fillRule="evenodd" d="M6 6.75A.75.75 0 016.75 6h3a.75.75 0 01.75.75v3a.75.75 0 01-.75.75h-3A.75.75 0 016 9.75v-3zM6.75 8.25h3v-1.5h-3v1.5z" clipRule="evenodd" />
        <path d="M9 12.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75h-.75a.75.75 0 01-.75-.75v-.75z" />
        <path fillRule="evenodd" d="M6 12.75a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v3a.75.75 0 01-.75.75h-3A.75.75 0 016 15.75v-3zM6.75 14.25h3v-1.5h-3v1.5z" clipRule="evenodd" />
        <path d="M12.75 6.75a.75.75 0 01.75-.75H18a.75.75 0 01.75.75v.75h.75a.75.75 0 010 1.5h-.75v2.25h.75a.75.75 0 010 1.5h-.75V15a.75.75 0 01-.75.75H15v1.5h.75a.75.75 0 010 1.5h-.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75h.75v-1.5H15a.75.75 0 01-.75-.75v-2.25a.75.75 0 01.75-.75h.75v-1.5h-1.5a.75.75 0 01-.75-.75V6.75z" />
        <path fillRule="evenodd" d="M3 6a.75.75 0 01.75-.75h18A.75.75 0 0122.5 6v12a.75.75 0 01-.75.75H3.75A.75.75 0 013 18V6zm1.5 1.5v9h16.5v-9H4.5z" clipRule="evenodd" />
    </svg>
);

export const HeartIcon = ({ className, isFilled }: { className?: string, isFilled: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFilled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

export const BookmarkIcon = ({ className, isFilled }: { className?: string, isFilled?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill={isFilled ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
);

export const Bars3Icon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

export const ArrowPathIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001a.75.75 0 01.38.651l.498 2.985a.75.75 0 01-.651.859l-2.985-.498a.75.75 0 01-.651-.859v-.001M16.023 9.348a4.5 4.5 0 00-4.5-4.5M16.023 9.348L12 12.375M11.25 15.75c-1.34 1.341-3.09 2.25-5.023 2.582a.75.75 0 01-.844-.757 48.58 48.58 0 01.332-1.67C6.083 15.36 6.75 13.983 7.5 12.75m3.75 3c-.155.53-.336 1.05-.542 1.558a.75.75 0 01-1.33.09 37.53 37.53 0 01-1.423-4.994m1.423 4.994L11.25 15.75M3.75 15.75c-1.012-1.002-1.012-2.624 0-3.626l1.28-1.272a2.25 2.25 0 013.182 0l2.365 2.365m-5.407-3.626l1.28 1.272m-1.28-1.272a3.75 3.75 0 015.303 0l2.365 2.365m1.5-1.5a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008m-4.5 4.5a.75.75 0 00.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75h-.008a.75.75 0 00-.75.75v.008" />
    </svg>
);

export const HomePlatterLogoIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M54.5 24.1L32 6.9 9.5 24.1" stroke="#8D6E63" strokeWidth="4" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M50.6 50.1V28.3" stroke="#8D6E63" strokeWidth="4" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.4 28.3V50.1" stroke="#8D6E63" strokeWidth="4" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.5 50.1H54.5" stroke="#8D6E63" strokeWidth="4" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 33.6h16v3.2H24v-3.2zm0 6.4h16v3.2H24v-6.4zm0 6.4h16v3.2H24v-9.6z" fill="#F97316"/>
        <path d="M29.6 33.6v-2.4a2.4 2.4 0 1 1 4.8 0v2.4" stroke="#FB923C" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round"/>
        <path d="M42.8 15.1c-4.4-3-9.5-0.4-10.4 4.5-2.1-4.1-6.8-6.1-10.6-4.3 0 0-3.5 6.9 2.1 11.5 0 0 4.1 3.5 8.5-1.5 0 0 2.5-5.1 7.1-4.7 0 0 4-2.1-3.3-7z" fill="#4CAF50"/>
    </svg>
);

export const ShoppingBagIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

export const SnowflakeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m-4.95-4.95l9.9 9.9M7.05 7.05l9.9 9.9M4.5 12h15m-4.95-4.95l-9.9 9.9m9.9-9.9l-9.9 9.9" />
    </svg>
);

export const DiyaIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.75 6.432A2.25 2.25 0 0010.5 4.5a2.25 2.25 0 00-2.25 2.25c0 1.14.855 2.093 1.957 2.228a.75.75 0 00.585-.526 2.383 2.383 0 014.208-.598.75.75 0 00.526.585 2.25 2.25 0 002.228-1.957A2.25 2.25 0 0015 6.75a2.25 2.25 0 00-2.25-.318z" />
      <path fillRule="evenodd" d="M12 21a.75.75 0 01-.75-.75 10.5 10.5 0 0110.5-10.5.75.75 0 010 1.5A9 9 0 0012 19.5a.75.75 0 01-.75.75h-.008zM12 21a.75.75 0 00.75-.75A10.5 10.5 0 002.25 9.75a.75.75 0 000 1.5A9 9 0 0112 19.5a.75.75 0 00.75.75h.008z" clipRule="evenodd" />
    </svg>
);

export const MarigoldIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0V6zM12 13.5a.75.75 0 110 1.5.75.75 0 010-1.5z" clipRule="evenodd" />
    </svg>
);

export const OnamFlowerIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 1.5a.75.75 0 01.75.75V6a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM5.636 6.364a.75.75 0 011.06 0l2.122 2.121a.75.75 0 01-1.061 1.06L5.636 7.424a.75.75 0 010-1.06zM1.5 12a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H2.25A.75.75 0 011.5 12zM5.636 17.636a.75.75 0 010-1.06l2.121-2.122a.75.75 0 111.06 1.061L6.7 17.636a.75.75 0 01-1.061 0zM12 22.5a.75.75 0 01-.75-.75v-3.75a.75.75 0 011.5 0V21.75a.75.75 0 01-.75.75zM18.364 17.636a.75.75 0 01-1.06 0l-2.122-2.121a.75.75 0 011.061-1.06l2.121 2.121a.75.75 0 010 1.06zM22.5 12a.75.75 0 01-.75.75h-3.75a.75.75 0 010 1.5H21.75a.75.75 0 01.75.75zM18.364 6.364a.75.75 0 010 1.06l-2.121 2.122a.75.75 0 11-1.06-1.061l2.121-2.121a.75.75 0 011.06 0z" />
    </svg>
);

export const SunIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 010 1.06l-1.591 1.591a.75.75 0 11-1.06-1.06l1.591-1.591a.75.75 0 011.06 0zm-12.728 0a.75.75 0 011.06 0l1.591 1.591a.75.75 0 11-1.06 1.06L6.166 7.166a.75.75 0 010-1.06zM12 21.75a.75.75 0 01-.75-.75v-2.25a.75.75 0 011.5 0v2.25a.75.75 0 01-.75.75zm-6.106-2.506a.75.75 0 010-1.06l1.591-1.591a.75.75 0 111.06 1.06l-1.591 1.591a.75.75 0 01-1.06 0zM18.894 17.894a.75.75 0 01-1.06 0l-1.591-1.591a.75.75 0 111.06-1.06l1.591 1.591a.75.75 0 010 1.06zM2.25 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010 1.5h2.25a.75.75 0 01.75-.75z" />
  </svg>
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.463A10.5 10.5 0 011.718 9.528a10.503 10.503 0 016.463-9.694.75.75 0 01.819.162z" clipRule="evenodd" />
  </svg>
);


export const ModakIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3.75a1.5 1.5 0 00-1.42 1.053l-.953 2.383-.954 2.383-2.383.954-2.383.953a1.5 1.5 0 000 2.841l2.383.953 2.383.954.954 2.383.953 2.383a1.5 1.5 0 002.84 0l.953-2.383.954-2.383 2.383-.954 2.383-.953a1.5 1.5 0 000-2.841l-2.383-.953-2.383-.954-.954-2.383L13.42 4.803A1.5 1.5 0 0012 3.75z" />
    </svg>
);

export const CrescentMoonAndStarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
        <defs>
            <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FBBF24', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#D97706', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path fill="url(#gold-gradient)" d="M12.2,2.2c-5.5,0-10,4.5-10,10s4.5,10,10,10c1.8,0,3.6-0.5,5.1-1.4c-0.4-0.1-0.8-0.3-1.2-0.5 c-3.4-1.6-5.6-5.1-5.6-9.1c0-3,1.4-5.6,3.6-7.4C13.5,2.3,12.8,2.2,12.2,2.2z M19.5,10.4l-2.5,0.8l-1,2.3c-0.1,0.2-0.4,0.2-0.5,0l-1-2.3l-2.5-0.8c-0.2-0.1-0.3-0.4-0.2-0.5l1.8-1.9l-1.8-1.9 c-0.2-0.2-0.1-0.5,0.2-0.5l2.5,0.8l1-2.3c0.1-0.2,0.4-0.2,0.5,0l1,2.3l2.5-0.8c0.2-0.1,0.3,0.4,0.2,0.5l-1.8,1.9l1.8,1.9 C19.9,10,19.7,10.5,19.5,10.4z"/>
    </svg>
);

export const DurgaEyeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 24" fill="currentColor" className={className}>
      <path d="M2,12 C2,12 8,2 24,2 C40,2 46,12 46,12 C46,12 40,22 24,22 C8,22 2,12 2,12 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="12" r="6" />
    </svg>
);

export const DandiyaIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="dandiya1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>
        <linearGradient id="dandiya2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect x="2" y="10" width="20" height="4" rx="2" transform="rotate(-45 12 12)" fill="url(#dandiya1)" />
      <rect x="2" y="10" width="20" height="4" rx="2" transform="rotate(45 12 12)" fill="url(#dandiya2)" />
    </svg>
);

export const LanternIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80" className={className}>
        <defs>
            <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FDE047', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#B45309', stopOpacity: 1 }} />
            </linearGradient>
            <radialGradient id="lantern-glow-final" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FEFDE8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.7" />
            </radialGradient>
            <pattern id="net-pattern" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                 <rect width="4" height="4" fill="transparent"/>
                 <circle cx="2" cy="2" r="0.5" fill="#B45309" fillOpacity="0.6"/>
            </pattern>
        </defs>
        
        {/* Main body glow */}
        <rect x="18" y="32" width="28" height="26" fill="url(#lantern-glow-final)" style={{filter: 'blur(4px)'}} />

        {/* Structure */}
        <g fill="url(#gold-gradient)" stroke="#78350F" strokeWidth="0.75">
            
            {/* Top Spire & Hook */}
            <path d="M32 0 L 35 6 L 29 6 Z" />
            <circle cx="32" cy="8" r="2.5" />

            {/* Top Dome */}
            <path d="M22 11 C 24 18, 40 18, 42 11 C 44 20, 48 24, 48 28 L 16 28 C 16 24, 20 20, 22 11 Z" />
            <rect x="16" y="11" width="32" height="17" fill="url(#net-pattern)" stroke="none" />
            <path d="M16 28 L 48 28 L 46 32 L 18 32 Z" />

            {/* Main Body (the "netted box") */}
            <rect x="18" y="32" width="28" height="26" fill="#FBBF24" stroke="none" opacity="0.2" />
            
            {/* Frame around the body */}
            <rect x="16" y="32" width="2" height="28" /> {/* Left Pillar */}
            <rect x="46" y="32" width="2" height="28" /> {/* Right Pillar */}
            <path d="M16 58 L 48 58 L 46 62 L 18 62 Z" />
            
            {/* Bottom Piece */}
            <path d="M18 62 L 46 62 C 44 68, 40 72, 32 74 C 24 72, 20 68, 18 62 Z" />
            <rect x="18" y="62" width="28" height="12" fill="url(#net-pattern)" stroke="none" />
            <circle cx="32" cy="77" r="2" />
        </g>
    </svg>
);

export const HangingLampIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <defs>
            <linearGradient id="lamp-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <radialGradient id="flame" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FEF3C7" />
                <stop offset="70%" stopColor="#F97316" />
                <stop offset="100%" stopColor="transparent" />
            </radialGradient>
        </defs>
        {/* Chain */}
        <path d="M12 1 V 6" stroke="#854d0e"/>
        {/* Lamp Body */}
        <path d="M8 14 C 8 16, 16 16, 16 14 L 16 9 H 8 Z" fill="url(#lamp-gold)" stroke="none" />
        {/* Flames */}
        <path d="M9 14 C 9 12.5, 8 11.5, 7.5 11 C 8 11.5, 9 12.5, 9 14 Z" fill="url(#flame)" stroke="none" />
        <path d="M15 14 C 15 12.5, 16 11.5, 16.5 11 C 16 11.5, 15 12.5, 15 14 Z" fill="url(#flame)" stroke="none" />
    </svg>
);

export const ExclamationCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);

export const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
);

export const LinkedInIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
);

export const InstagramIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.585-.012-4.85-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.44-1.441-1.44z"/>
    </svg>
);

export const FacebookIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
    </svg>
);

export const TwitterIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

export const TagIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 1.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9h.008v.008H6V9z" />
    </svg>
);

export const SantaHatIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className}>
        <path fill="#E8E8E8" d="M406.4,213.3c-3.1-4.8-6.5-9.4-10-13.9c-27.4-35.2-70.2-56.9-117.8-60.3c-2.3-.2-4.6-.3-6.9-.3 c-30.8,0-60.4,9-86.2,26c-19.6,12.9-35.8,29.9-47.5,49.8c-11.8,20-18.4,42.7-18.8,66.3c0,2.3,0,4.6,.1,6.9 c1.2,46.5,22.7,88.7,57.7,116.3c4.7,3.8,9.7,7.2,14.9,10.4c6.2,3.7,12.7,6.9,19.4,9.5c-11-5-21.6-11.3-31.5-18.8 c-28.4-21.6-46.8-53.7-49.8-89.8c-.3-4- .4-8-.4-12.1c.4-21.7,6.4-42.5,17.1-61c10.8-18.6,25.7-34.4,44-46.3 c24.2-15.9,52.2-24.3,81.4-24.3c2.1,0,4.2,0.1,6.3,0.2c44.8,3.2,85,23.8,110.8,57.1c3.3,4.2,6.5,8.6,9.5,13.1 C440.6,220.1,424.3,212.7,406.4,213.3z"/>
        <path fill="#D84242" d="M406.4,213.3c-17.9-.6-34.2,6.8-44.5,21.1c-3.3,4.5-6.5,9.1-9.5,13.9c-25.8,33.3-66,53.9-110.8,57.1 c-2.1,0.1-4.2,0.2-6.3,0.2c-29.2,0-57.2-8.4-81.4-24.3c-18.3-11.9-33.2-27.7-44-46.3c-10.7-18.5-16.7-39.3-17.1-61 c0-4.1,0.1-8.1,0.4-12.1c3.1-36.1,21.4-68.2,49.8-89.8c9.9-7.5,20.5-13.8,31.5-18.8c-6.7,2.6-13.2,5.8-19.4,9.5 c-5.2,3.1-10.2,6.6-14.9,10.4c-35,27.6-56.5,69.8-57.7,116.3c-0.1,2.3-0.1,4.6-0.1,6.9c0.4,23.6,7,46.3,18.8,66.3 c11.7,19.9,27.9,36.9,47.5,49.8c25.8,17,55.4,26,86.2,26c2.3,0,4.6-0.1,6.9-0.3c47.5-3.4,90.4-25.1,117.8-60.3 c3.5-4.5,6.9-9.1,10-13.9C440.6,220.1,424.3,212.7,406.4,213.3z"/>
        <circle fill="#E8E8E8" cx="440.9" cy="192.2" r="41.1"/>
    </svg>
);

export const ChristmasBellsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className={className}>
        <path d="M42.6,46.2c-1.5-1-1.8-3.1-0.8-4.6l5.2-7.9c1-1.5,3.1-1.8,4.6-0.8c1.5,1,1.8,3.1,0.8,4.6l-5.2,7.9 C46.2,46.9,44.1,47.2,42.6,46.2z" fill="#D84242"/>
        <path d="M21.4,46.2c1.5-1,1.8-3.1,0.8-4.6l-5.2-7.9c-1-1.5-3.1-1.8-4.6-0.8c-1.5,1-1.8,3.1-0.8,4.6l5.2,7.9 C17.8,46.9,19.9,47.2,21.4,46.2z" fill="#D84242"/>
        <path d="M24,20c-8.8,0-16,7.2-16,16s7.2,16,16,16h0.1c-8.9-0.5-16.1-7.8-16.1-16.9C8,27.8,15.2,20.5,24,20z" fill="#F4D03F"/>
        <path d="M40,20c-8.8,0-16,7.2-16,16s7.2,16,16,16h0.1C31.2,51.5,24,44.2,24,35.1C24,27.8,31.2,20.5,40,20z" fill="#F7DC6F"/>
        <path d="M24,52c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S26.2,52,24,52z" fill="#B7950B"/>
        <path d="M40,52c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S42.2,52,40,52z" fill="#B7950B"/>
        <path d="M32,12c-3.3,0-6,2.7-6,6v2h12v-2C38,14.7,35.3,12,32,12z" fill="#D84242"/>
    </svg>
);

export const AnimatedSantaIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" className={className}>
        {/* Gifts dropping from the bag */}
        <rect x="25" y="22" width="5" height="5" rx="1" fill="#3B82F6" className="animate-gift-fall" style={{ animationDelay: '0s' }} />
        <rect x="28" y="24" width="4" height="4" rx="1" fill="#16A34A" className="animate-gift-fall" style={{ animationDelay: '0.5s' }} />

        {/* Santa Group */}
        <g className="animate-santa-walk-body">
            {/* Back Leg */}
            <rect x="14" y="28" width="5" height="10" rx="2.5" fill="#B91C1C" className="origin-top animate-santa-walk-leg-back" />

            {/* Bag */}
            <path d="M20 20 C 30 20, 35 30, 30 35 S 15 38, 20 20 Z" fill="#BE123C" stroke="#7F1D1D" strokeWidth="0.5"/>
            
            {/* Body */}
            <rect x="12" y="18" width="10" height="12" rx="3" fill="#D84242" />
            {/* Belt */}
            <rect x="11" y="24" width="12" height="3" fill="#1E293B" />
            <rect x="16" y="23" width="2" height="5" fill="#FBBF24" />

            {/* Head */}
            <circle cx="17" cy="15" r="5" fill="#FDE8E8" />
            {/* Beard */}
            <path d="M13 17 q 4 4 8 0 v -3 q -4 -3 -8 0 z" fill="#FFFFFF" />
            {/* Hat */}
            <path d="M14 12 l 6 -4 l 2 4 l -6 4 z" fill="#D84242" />
            <circle cx="21" cy="8" r="3" fill="#FFFFFF" />
            {/* Eye */}
            <circle cx="19" cy="14" r="0.8" fill="#1E293B" />
        </g>
        
        {/* Front Leg */}
        <rect x="18" y="28" width="5" height="10" rx="2.5" fill="#D84242" className="origin-top animate-santa-walk-leg-front" />
    </svg>
);

export const EyeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
);

export const FlagIcon = ({ className, isFilled }: { className?: string, isFilled?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill={isFilled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
    </svg>
);

export const LifebuoyIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);

export const FolderPlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h13.5a3 3 0 010 6H6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l.375-.375a2.25 2.25 0 013.182 3.182l-.375.375M15.75 18l.375.375a2.25 2.25 0 01-3.182 3.182l-.375-.375" />
    </svg>
);

export const BookmarkSquareIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
    </svg>
);

export const TrophyIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5m-9 4.5v-4.5m0-3h9m-9 0a3 3 0 013-3h3a3 3 0 013 3m-6 0v-4.5" />
    </svg>
);


// --- BADGE ICONS ---

export const FirstOrderBadgeIcon = ShoppingCartIcon;
export const FiveOrdersBadgeIcon = ShoppingBagIcon;
export const FirstReviewBadgeIcon = StarIcon;
export const TopReviewerBadgeIcon = TrophyIcon;

export const CUSTOMER_BADGES: Badge[] = [
    { id: 'first_order', name: 'First Order', description: 'Placed your very first order on Home Platter.', icon: FirstOrderBadgeIcon },
    { id: 'five_orders', name: 'Regular Customer', description: 'Placed five orders. You\'re a valued regular!', icon: FiveOrdersBadgeIcon },
    { id: 'first_review', name: 'First Feedback', description: 'Submitted your first review and helped a chef grow.', icon: FirstReviewBadgeIcon },
    { id: 'top_reviewer', name: 'Top Reviewer', description: 'Submitted five reviews, helping the community.', icon: TopReviewerBadgeIcon },
];

export const PROVIDER_BADGES: Badge[] = [
    { id: 'top_rated', name: 'Top Rated', description: 'Maintained an average rating above 4.8.', icon: StarIcon },
    { id: 'community_favorite', name: 'Community Favorite', description: 'Received over 50 orders.', icon: HeartIcon },
];

export const MicrophoneIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" />
    </svg>
);

export const ClockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);