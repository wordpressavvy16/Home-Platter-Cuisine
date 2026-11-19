import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../hooks/useAuth';
import * as authApi from '../api/authApi';
import { XMarkIcon, ShieldCheckIcon } from '../constants';
import Loader from './Loader';

interface MfaSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MfaSetupModal: React.FC<MfaSetupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [step, setStep] = useState<'loading' | 'setup' | 'verify' | 'success'>('loading');
  const [setupData, setSetupData] = useState<{ secret: string, qrCodeDataUrl: string } | null>(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const modalRoot = document.getElementById('modal-root');

  useEffect(() => {
    if (isOpen && step === 'loading') {
      const fetchSetupData = async () => {
        if (!token) {
          setError('Authentication error.');
          return;
        }
        try {
          const data = await authApi.setupMfa(token);
          setSetupData(data);
          setStep('setup');
        } catch (err: any) {
          setError(err.message || 'Failed to start MFA setup.');
        }
      };
      fetchSetupData();
    }
    if (!isOpen) { // Reset on close
        setStep('loading');
        setSetupData(null);
        setOtp('');
        setError('');
    }
  }, [isOpen, token, step]);

  if (!isOpen || !modalRoot) return null;
  
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !otp.trim() || otp.trim().length !== 6) {
        setError("Please enter a valid 6-digit code.");
        return;
    }
    setIsVerifying(true);
    setError('');
    try {
        await authApi.verifyMfa(token, otp);
        setStep('success');
        setTimeout(() => onSuccess(), 2000); // Close after showing success
    } catch (err: any) {
        setError(err.message || "Verification failed. Please check the code and try again.");
    } finally {
        setIsVerifying(false);
    }
  }
  
  const renderContent = () => {
      switch (step) {
          case 'loading':
              return <Loader text="Generating secure key..." />;
          case 'setup':
              if (!setupData) return <p className="text-red-500">Could not load setup data.</p>;
              return (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">1. Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy).</p>
                    <img src={setupData.qrCodeDataUrl} alt="MFA QR Code" className="mx-auto border p-2"/>
                    <p className="text-sm text-gray-500 mt-4">Or enter this key manually:</p>
                    <p className="font-mono bg-gray-100 p-2 rounded-md my-2 text-sm">{setupData.secret}</p>
                    <button onClick={() => setStep('verify')} className="mt-4 w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-brand-dark">
                        Next
                    </button>
                  </div>
              );
          case 'verify':
              return (
                  <form onSubmit={handleVerify} className="text-center">
                      <p className="text-gray-600 mb-4">2. Enter the 6-digit code from your authenticator app to complete the setup.</p>
                      <input
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full p-3 text-2xl text-center tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
                      />
                       <button type="submit" disabled={isVerifying} className="mt-4 w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-brand-dark disabled:bg-gray-400">
                           {isVerifying ? 'Verifying...' : 'Verify & Enable'}
                       </button>
                  </form>
              );
          case 'success':
              return (
                   <div className="text-center py-8">
                        <ShieldCheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                        <h3 className="text-2xl font-bold text-green-800">MFA Enabled!</h3>
                        <p className="text-gray-600 mt-2">Your account is now more secure.</p>
                   </div>
              )
      }
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="mfa-setup-modal-title" className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 id="mfa-setup-modal-title" className="text-2xl font-bold text-gray-800 font-serif">
            Setup Multi-Factor Authentication
          </h2>
          <button onClick={onClose} aria-label="Close MFA setup" className="p-2 rounded-full hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <div className="p-6">
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          {renderContent()}
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default MfaSetupModal;
