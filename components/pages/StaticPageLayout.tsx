import React from 'react';

interface StaticPageLayoutProps {
  title: string;
  children: React.ReactNode;
  navigate: (path: string, params?: Record<string, any>) => void;
  onCartClick: () => void;
}

const StaticPageLayout: React.FC<StaticPageLayoutProps> = ({ title, children, navigate, onCartClick }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-text font-serif mb-8">
        {title}
      </h1>
      <div className="max-w-4xl prose prose-lg text-text/90">
        {children}
      </div>
    </div>
  );
};

export default StaticPageLayout;