import React from 'react';
import type { Notification } from '../types';
import { BellIcon } from '../constants';

interface NotificationPanelProps {
    notifications: Notification[];
    // FIX: Replaced deprecated Route enum with string path for navigation.
    navigate: (path: string, params?: Record<string, any>) => void;
    onClose: () => void;
}

const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, navigate, onClose }) => {
    
    const handleNotificationClick = (notification: Notification) => {
        if(notification.linkTo) {
            // FIX: Use 'path' property from linkTo object, as 'route' is deprecated.
            navigate(notification.linkTo.path, notification.linkTo.params);
        }
        onClose();
    };

    return (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 animate-fade-in-down z-50">
            <div className="p-4 border-b">
                <h3 className="font-bold text-gray-800">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <button 
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className="w-full text-left flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b"
                        >
                            {!n.isRead && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                            )}
                            <div className={`flex-grow ${n.isRead ? 'pl-5' : ''}`}>
                                <p className="text-sm text-gray-700">{n.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{timeSince(n.timestamp)}</p>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="text-center p-8 text-gray-500">
                        <BellIcon className="w-12 h-12 mx-auto text-gray-300 mb-2"/>
                        <p className="font-semibold">No notifications yet</p>
                        <p className="text-sm">Important updates will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;