import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as userApi from '../api/userApi';
import type { User } from '../types';
import { BellIcon, CheckCircleIcon, ExclamationCircleIcon } from '../constants';
import Loader from './Loader';

const ToggleSwitch = ({ label, isChecked, onChange, disabled = false }: { label: string, isChecked: boolean, onChange: (checked: boolean) => void, disabled?: boolean }) => (
    <label className={`flex items-center justify-between cursor-pointer py-2 ${disabled ? 'opacity-50' : ''}`}>
        <span className="text-gray-700 font-medium">{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={isChecked} onChange={e => onChange(e.target.checked)} disabled={disabled} />
            <div className={`block w-10 h-6 rounded-full transition ${isChecked ? 'bg-brand-primary' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${isChecked ? 'translate-x-4' : ''}`}></div>
        </div>
    </label>
);

const NotificationSettingsPanel: React.FC = () => {
    // --- Existing Push Notification Logic ---
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSubscribing, setIsSubscribing] = useState(false);
    
    // --- New In-App Notification Logic ---
    const { user, token } = useAuth();
    const [preferences, setPreferences] = useState<User['notificationPreferences']>({
        orderUpdates: true,
        newMessages: true,
        promotions: true,
    });
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    useEffect(() => {
        if (user && token) {
            setIsLoadingProfile(true);
            userApi.getUserProfile(user.id, token)
                .then(fullUser => {
                    setPreferences({
                        orderUpdates: fullUser.notificationPreferences?.orderUpdates ?? true,
                        newMessages: fullUser.notificationPreferences?.newMessages ?? true,
                        promotions: fullUser.notificationPreferences?.promotions ?? true,
                    });
                })
                .catch(() => setError('Could not load your notification preferences.'))
                .finally(() => setIsLoadingProfile(false));
        } else {
            setIsLoadingProfile(false);
        }
    }, [user, token]);


    const requestPermission = async () => {
        if (!('Notification' in window)) {
            setError('This browser does not support desktop notifications.');
            return;
        }

        const status = await Notification.requestPermission();
        setPermission(status);

        if (status === 'granted') {
            await subscribeUserToPush();
        }
    };
    
    const subscribeUserToPush = async () => {
        setIsSubscribing(true);
        setError('');
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                // In a real app, you'd get the VAPID key from your server
                const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'; // This needs to be generated on a real server
                
                // For this simulation, we proceed without a key, which might fail on some browsers
                // but demonstrates the flow.
                await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    // applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                });
            }
            console.log('User is subscribed.');
        } catch (err) {
            console.error('Failed to subscribe the user: ', err);
            setError('Failed to subscribe for notifications. Please try again.');
        } finally {
            setIsSubscribing(false);
        }
    };

    const sendTestNotification = () => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_TEST_NOTIFICATION',
            });
        }
    };
    
    const handlePreferenceChange = async (key: keyof NonNullable<User['notificationPreferences']>, value: boolean) => {
        if (!user || !token) return;

        const newPreferences = { ...preferences, [key]: value };
        setPreferences(newPreferences); // Optimistic update

        setIsSaving(true);
        setError('');
        try {
            await userApi.updateUserNotificationPreferences(user.id, newPreferences, token);
        } catch (err) {
            setError('Failed to save settings. Please try again.');
            // Revert on failure
            setPreferences(prev => ({ ...prev, [key]: !value }));
        } finally {
            // Give user feedback for a moment
            setTimeout(() => setIsSaving(false), 500);
        }
    };

    const renderPushNotificationContent = () => {
        if (!('Notification' in window)) {
            return <p className="text-red-500">This browser does not support push notifications.</p>;
        }

        switch (permission) {
            case 'granted':
                return (
                    <div className="text-center">
                        <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2"/>
                        <p className="font-semibold text-green-700">Push Notifications are enabled!</p>
                        <p className="text-sm text-gray-500">You'll get updates even when the app is closed.</p>
                        <button onClick={sendTestNotification} className="mt-4 text-sm font-semibold bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300">
                            Send a Test Notification
                        </button>
                    </div>
                );
            case 'denied':
                return (
                    <div className="text-center">
                        <ExclamationCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-2"/>
                        <p className="font-semibold text-red-700">Push Notifications are blocked.</p>
                        <p className="text-sm text-gray-500">You need to enable them in your browser settings to receive updates.</p>
                    </div>
                );
            case 'default':
            default:
                return (
                    <div className="text-center">
                        <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-2"/>
                        <p className="font-semibold text-gray-700">Get updates faster!</p>
                        <p className="text-sm text-gray-500">Enable push notifications to get real-time alerts on your orders.</p>
                        <button onClick={requestPermission} disabled={isSubscribing} className="mt-4 bg-brand-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-brand-dark disabled:bg-gray-400">
                            {isSubscribing ? 'Enabling...' : 'Enable Push Notifications'}
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Browser Push Notifications</h3>
                {renderPushNotificationContent()}
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">In-App Notification Preferences</h3>
                <p className="text-sm text-gray-500 mb-4">Choose which notifications you see inside the app.</p>
                {isLoadingProfile ? <Loader text="Loading preferences..." /> : (
                    <div className="space-y-2 divide-y">
                        <ToggleSwitch
                            label="Order Status Updates"
                            isChecked={preferences.orderUpdates}
                            onChange={(value) => handlePreferenceChange('orderUpdates', value)}
                            disabled={isSaving}
                        />
                         <ToggleSwitch
                            label="New Messages"
                            isChecked={preferences.newMessages}
                            onChange={(value) => handlePreferenceChange('newMessages', value)}
                            disabled={isSaving}
                        />
                         <ToggleSwitch
                            label="Promotions & Announcements"
                            isChecked={preferences.promotions}
                            onChange={(value) => handlePreferenceChange('promotions', value)}
                            disabled={isSaving}
                        />
                    </div>
                )}
                {isSaving && <p className="text-xs text-gray-500 text-right mt-2 animate-pulse">Saving...</p>}
            </div>
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </div>
    );
};

export default NotificationSettingsPanel;