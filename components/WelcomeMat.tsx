import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../hooks/useAuth';
import { HomePlatterLogoIcon, ArrowPathIcon, MenuIcon, ChatBubbleIcon, CogIcon, UserIcon, TrendingUpIcon } from '../constants';

interface WelcomeMatProps {
  navigate: (path: string, params?: Record<string, any>) => void;
}

const WelcomeMat: React.FC<WelcomeMatProps> = ({ navigate }) => {
  const { user, setJustLoggedIn } = useAuth();
  const modalRoot = document.getElementById('modal-root');

  useEffect(() => {
    // Automatically close after a few seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 7000); // 7 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    if (setJustLoggedIn) {
      setJustLoggedIn(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };
  
  if (!modalRoot || !user) return null;

  const WelcomeCard: React.FC<{ title: string; Icon: React.FC<{ className?: string }>; onClick: () => void }> = ({ title, Icon, onClick }) => (
    <button onClick={onClick} className="p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300 text-center flex flex-col items-center justify-center border-t-4 border-transparent hover:border-brand-primary">
        <Icon className="w-12 h-12 text-brand-primary mb-4" />
        <span className="text-lg font-semibold text-brand-dark">{title}</span>
    </button>
  );

  const renderContent = () => {
    switch (user.role) {
      case 'CUSTOMER':
        return (
          <>
            <h2 className="text-3xl font-bold text-brand-dark mb-8">What would you like to do first?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <WelcomeCard title="View Your Feed" Icon={UserIcon} onClick={() => handleNavigate('/')} />
                <WelcomeCard title="Re-order Your Regulars" Icon={ArrowPathIcon} onClick={() => handleNavigate('/profile')} />
                <WelcomeCard title="Explore New Kitchens" Icon={TrendingUpIcon} onClick={() => handleNavigate('/')} />
            </div>
          </>
        );
      case 'PROVIDER':
        return (
           <>
            <h2 className="text-3xl font-bold text-brand-dark mb-8">Let's get cooking!</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <WelcomeCard title="Go to Dashboard" Icon={HomePlatterLogoIcon} onClick={() => handleNavigate('/dashboard')} />
                <WelcomeCard title="Manage Menu" Icon={MenuIcon} onClick={() => handleNavigate('/dashboard/menu')} />
                <WelcomeCard title="Check Messages" Icon={ChatBubbleIcon} onClick={() => handleNavigate('/dashboard')} />
            </div>
           </>
        );
      case 'SUPER_ADMIN':
        return (
           <>
            <h2 className="text-3xl font-bold text-brand-dark mb-8">Welcome, Admin.</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <WelcomeCard title="Main Dashboard" Icon={HomePlatterLogoIcon} onClick={() => handleNavigate('/super-admin')} />
                <WelcomeCard title="Support Tickets" Icon={ChatBubbleIcon} onClick={() => handleNavigate('/super-admin')} />
                <WelcomeCard title="Manage Providers" Icon={CogIcon} onClick={() => handleNavigate('/super-admin')} />
            </div>
           </>
        );
      default:
        return null;
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-brand-light rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-4xl animate-slide-up text-center">
        <h1 className="text-4xl sm:text-5xl font-bold font-serif text-brand-dark mb-4">
          Welcome back, {user.name.split(' ')[0]}!
        </h1>
        {renderContent()}
        <button onClick={handleClose} className="mt-12 text-gray-600 font-semibold hover:underline">
          Or just continue browsing...
        </button>
      </div>
    </div>,
    modalRoot
  );
};

export default WelcomeMat;