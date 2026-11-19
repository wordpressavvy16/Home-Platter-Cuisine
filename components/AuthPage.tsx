import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types';
import { BackArrowIcon, ExclamationCircleIcon, CheckCircleIcon } from '../constants';
import { useTypingPlaceholder } from '../hooks/useTypingPlaceholder';

interface AuthPageProps {
  routeParams?: Record<string, any> | null;
  navigate: (path: string, params?: Record<string, any>) => void;
}

type AuthMode = 'login' | 'signup' | 'reset_request' | 'reset_success' | 'mfa_challenge';

const AuthPage: React.FC<AuthPageProps> = ({ routeParams, navigate }) => {
  const [authMode, setAuthMode] = useState<AuthMode>(
    routeParams?.mode === 'signup' ? 'signup' : 'login'
  );
  const { login, signup, isLoading, error: authError, clearError, verifyLoginWithMfa } = useAuth();
  
  // --- State for each form field ---
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  
  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  
  const [role, setRole] = useState<User['role']>('CUSTOMER');
  
  // --- New state for MFA flow ---
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [otp, setOtp] = useState('');

  // --- Animated Placeholders ---
  const namePlaceholder = useTypingPlaceholder(['Suresh Sharma', 'Deepika Rao', 'Amit Kumar']);
  const emailPlaceholder = useTypingPlaceholder(['suresh.sharma@example.com', 'your.name@email.com']);
  const passwordPlaceholder = '********'; // Static for security

  // --- Real-time Validation Logic ---
  const validation = useMemo(() => {
    const isNameValid = name.trim().length > 2;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 8;

    return {
      name: { isValid: isNameValid, error: 'Name must be at least 3 characters.' },
      email: { isValid: isEmailValid, error: 'Please enter a valid email address.' },
      password: { isValid: isPasswordValid, error: 'Password must be at least 8 characters.' },
    };
  }, [name, email, password]);
  
  const isFormValid = useMemo(() => {
    if (authMode === 'login') return validation.email.isValid && validation.password.isValid;
    if (authMode === 'signup') return validation.name.isValid && validation.email.isValid && validation.password.isValid;
    if (authMode === 'reset_request') return validation.email.isValid;
    if (authMode === 'mfa_challenge') return otp.length === 6;
    return false;
  }, [authMode, validation, otp]);

  useEffect(() => {
      clearError(); // Clear any old errors when mode changes
      setAuthMode(routeParams?.mode === 'signup' ? 'signup' : 'login');
      if (routeParams?.mode === 'signup' && routeParams?.role === 'PROVIDER') {
          setRole('PROVIDER');
      }
  }, [routeParams, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === 'mfa_challenge') {
        if (!mfaToken) return;
        try {
            await verifyLoginWithMfa(mfaToken, otp);
            // On success, AuthProvider handles state and App.tsx handles navigation
        } catch (err) {
            console.error("MFA verification failed:", err);
            // Error is set in AuthProvider and will be displayed via authError
        }
        return;
    }

    setEmailTouched(true); 
    if (authMode === 'signup') setNameTouched(true);
    if (authMode !== 'reset_request') setPasswordTouched(true);

    if (!isFormValid) return;

    if (authMode === 'login') {
      const result = await login(email, password);
      // Check the result to see if the next step is MFA
      if (result?.mfaRequired && result.mfaToken) {
          setMfaToken(result.mfaToken);
          setAuthMode('mfa_challenge');
      }
      // If result is null, it means login failed and the error is already set in the context.
      // If !result.mfaRequired, login was fully successful and the provider will handle the redirect.
    } else if (authMode === 'signup') {
      const success = await signup(name, email, password, role);
      if (!success) {
          console.error("Signup failed. See auth error in context.");
      }
      // On success, the main App component will navigate away automatically.
    } else if (authMode === 'reset_request') {
      setAuthMode('reset_success');
    }
  };

  const handleToggleMode = () => {
    setAuthMode(prev => prev === 'login' ? 'signup' : 'login');
    clearError();
    // Reset all state
    setName('');
    setNameTouched(false);
    setEmail('');
    setEmailTouched(false);
    setPassword('');
    setPasswordTouched(false);
    setRole('CUSTOMER');
    setOtp('');
    setMfaToken(null);
  };

  const getInputClasses = (isTouched: boolean, isValid: boolean) => {
    if (!isTouched) return 'border-black/10 dark:border-white/10 focus:ring-brand-primary/50';
    return isValid 
      ? 'border-green-500 ring-1 ring-green-500' 
      : 'border-red-500 ring-1 ring-red-500';
  };
  
  const renderFormContent = () => {
    switch (authMode) {
        case 'mfa_challenge':
            return (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="otp" className="text-sm font-medium text-text/80 block mb-1">Authenticator Code</label>
                         <input
                            id="otp"
                            type="text"
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            placeholder="123456"
                            maxLength={6}
                            className="w-full p-3 text-2xl text-center tracking-widest border rounded-lg focus:ring-2 focus:ring-brand-primary bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                          />
                    </div>
                    {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
                    <div>
                        <button type="submit" disabled={isLoading || !isFormValid} className="w-full bg-brand-primary text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center">
                            {isLoading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                    </div>
                </form>
            );
        case 'reset_success':
            return (
                <div className="text-center">
                    <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500 mb-4" />
                    <h1 className="text-2xl font-bold text-text">Check your email</h1>
                    <p className="text-text/80 mt-2">If an account with that email exists, we've sent a link to reset your password.</p>
                    <button onClick={() => setAuthMode('login')} className="mt-6 w-full bg-brand-primary text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
                        Back to Login
                    </button>
                </div>
            );
        case 'reset_request':
            return (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-text/80 block mb-1">Email Address</label>
                        <div className="relative">
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setEmailTouched(true)} placeholder={emailPlaceholder} className={`w-full p-3 border rounded-lg focus:outline-none transition bg-black/5 dark:bg-white/5 text-text ${getInputClasses(emailTouched, validation.email.isValid)}`} />
                            {emailTouched && (validation.email.isValid ? <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" /> : <ExclamationCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />)}
                        </div>
                        {emailTouched && !validation.email.isValid && <p className="text-red-600 text-xs mt-1">{validation.email.error}</p>}
                    </div>
                    <div>
                        <button type="submit" disabled={isLoading || !isFormValid} className="w-full bg-brand-primary text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center">
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>
            );
        case 'login':
        case 'signup':
        default:
            return (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {authMode === 'signup' && (
                    <>
                      <div>
                        <label htmlFor="name" className="text-sm font-medium text-text/80 block mb-1">Full Name</label>
                        <div className="relative">
                          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setNameTouched(true)} placeholder={namePlaceholder} className={`w-full p-3 border rounded-lg focus:outline-none transition bg-black/5 dark:bg-white/5 text-text ${getInputClasses(nameTouched, validation.name.isValid)}`} />
                          {nameTouched && (validation.name.isValid ? <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" /> : <ExclamationCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />)}
                        </div>
                        {nameTouched && !validation.name.isValid && <p className="text-red-600 text-xs mt-1">{validation.name.error}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text/80 block mb-2">I am a...</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => setRole('CUSTOMER')} className={`p-3 rounded-lg border-2 text-center transition ${role === 'CUSTOMER' ? 'bg-brand-primary/20 border-brand-primary ring-2 ring-brand-primary text-brand-dark dark:text-brand-primary' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}>
                                Customer
                            </button>
                             <button type="button" onClick={() => setRole('PROVIDER')} className={`p-3 rounded-lg border-2 text-center transition ${role === 'PROVIDER' ? 'bg-brand-primary/20 border-brand-primary ring-2 ring-brand-primary text-brand-dark dark:text-brand-primary' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}>
                                Kitchen Owner
                            </button>
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-text/80 block mb-1">Email Address</label>
                     <div className="relative">
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setEmailTouched(true)} placeholder={emailPlaceholder} className={`w-full p-3 border rounded-lg focus:outline-none transition bg-black/5 dark:bg-white/5 text-text ${getInputClasses(emailTouched, validation.email.isValid)}`} />
                        {emailTouched && (validation.email.isValid ? <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" /> : <ExclamationCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />)}
                    </div>
                    {emailTouched && !validation.email.isValid && <p className="text-red-600 text-xs mt-1">{validation.email.error}</p>}
                  </div>
                   <div>
                    <label htmlFor="password"className="text-sm font-medium text-text/80 block mb-1">Password</label>
                    <div className="relative">
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => setPasswordTouched(true)} placeholder={passwordPlaceholder} className={`w-full p-3 border rounded-lg focus:outline-none transition bg-black/5 dark:bg-white/5 text-text ${getInputClasses(passwordTouched, validation.password.isValid)}`} />
                        {passwordTouched && (validation.password.isValid ? <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" /> : <ExclamationCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />)}
                    </div>
                    {passwordTouched && !validation.password.isValid && <p className="text-red-600 text-xs mt-1">{validation.password.error}</p>}
                  </div>
                   {authMode === 'login' && (
                        <div className="text-right">
                            <button type="button" onClick={() => setAuthMode('reset_request')} className="text-sm font-semibold text-brand-primary hover:underline">
                                Forgot Password?
                            </button>
                        </div>
                   )}
                  {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
                  <div>
                    <button type="submit" disabled={isLoading || !isFormValid} className="w-full bg-brand-primary text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center">
                      {isLoading ? (authMode === 'login' ? 'Logging in...' : 'Signing up...') : (authMode === 'login' ? 'Login' : 'Sign Up')}
                    </button>
                  </div>
                </form>
            );
    }
  };

  const pageTitles = {
    login: { title: 'Welcome Back', subtitle: 'Sign in to continue to Home Platter' },
    signup: { title: 'Create Account', subtitle: 'Join our community of food lovers' },
    reset_request: { title: 'Forgot Password', subtitle: 'Enter your email to receive a reset link.' },
    mfa_challenge: { title: 'Two-Factor Authentication', subtitle: 'Enter the code from your authenticator app.' },
    reset_success: { title: '', subtitle: '' },
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl shadow-2xl border border-white/40 dark:border-white/10 rounded-xl p-6 sm:p-8 relative text-text">
        <button 
          onClick={() => {
            if (authMode === 'reset_request' || authMode === 'reset_success' || authMode === 'mfa_challenge') {
                setAuthMode('login');
                clearError();
            } else {
                navigate('/');
            }
          }} 
          className="absolute top-4 left-4 text-text/70 hover:text-text transition-colors flex items-center gap-1 text-sm font-semibold"
        >
          <BackArrowIcon className="w-4 h-4" />
          {authMode === 'reset_request' || authMode === 'reset_success' || authMode === 'mfa_challenge' ? 'Back to Login' : 'Back to Home'}
        </button>
        {authMode !== 'reset_success' && (
            <div className="text-center my-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-text font-serif">
                {pageTitles[authMode].title}
                </h1>
                <p className="text-text/80 mt-2">
                {pageTitles[authMode].subtitle}
                </p>
            </div>
        )}
        
        {renderFormContent()}

        {(authMode === 'login' || authMode === 'signup') && (
            <div className="mt-6 text-center">
                <button onClick={handleToggleMode} className="text-sm text-brand-primary hover:underline">
                    {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;