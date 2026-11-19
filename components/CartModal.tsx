
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useCart } from '../hooks/useCart';
import { VegIcon, NonVegIcon, XMarkIcon, TrashIcon, BookmarkSquareIcon } from '../constants';
import type { CartItem, MealProvider } from '../types';
import * as providerApi from '../api/providerApi';
import { useTheme } from '../hooks/useTheme';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onCheckout }) => {
    const { cart, groupedCart, updateQuantity, removeFromCart, clearCart, totalPrice, cartCount } = useCart();
    const { theme } = useTheme();
    const [providers, setProviders] = useState<MealProvider[]>([]);
    const modalRoot = document.getElementById('modal-root');
    const isDark = theme.name.includes('Dark');

    useEffect(() => {
        if (isOpen) {
            providerApi.getProviders().then(setProviders).catch(console.error);
        }
    }, [isOpen]);

    const { finalTotalPrice, totalDiscount } = useMemo(() => {
        let finalTotal = 0;
        let discount = 0;
        if (!providers.length) return { finalTotalPrice: totalPrice, totalDiscount: 0 };
        for (const providerId of Object.keys(groupedCart)) {
            const providerData = groupedCart[providerId];
            const items = providerData.items;
            const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const provider = providers.find(p => p.id === providerId);
            const thresholdDiscount = provider?.orderThresholdDiscount;
            if (thresholdDiscount && subtotal >= thresholdDiscount.threshold) {
                const discountAmount = subtotal * (thresholdDiscount.percentage / 100);
                discount += discountAmount;
                finalTotal += (subtotal - discountAmount);
            } else {
                finalTotal += subtotal;
            }
        }
        return { finalTotalPrice: finalTotal, totalDiscount: discount };
    }, [groupedCart, providers, totalPrice]);

    if (!isOpen || !modalRoot) return null;

    const handleCheckout = () => {
        onClose();
        onCheckout();
    }

    const CartLineItem: React.FC<{ item: CartItem }> = ({ item }) => {
        const isPlan = item.itemType === 'PLAN';
        const TypeIcon = isPlan ? BookmarkSquareIcon : item.type === 'NON_VEG' ? NonVegIcon : VegIcon;
        
        return (
            <div className={`flex items-center gap-4 py-4 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                {item.imageUrl ? (
                     <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover"/>
                ) : (
                    <div className="w-16 h-16 rounded-md bg-background/50 flex items-center justify-center">
                        <TypeIcon className="w-8 h-8 text-brand-primary"/>
                    </div>
                )}
                <div className="flex-grow">
                    <div className="flex items-center gap-2"><TypeIcon /><h4 className="font-semibold text-text">{item.name}</h4></div>
                     <p className="text-text/80 text-sm">₹{item.price}{isPlan && ` / ${item.duration?.toLowerCase()}`}</p>
                </div>
                {!isPlan && (
                    <div className="flex items-center gap-2 text-text">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Decrease quantity of ${item.name}`} className={`px-2 py-0.5 border ${isDark ? 'border-white/20' : 'border-black/20'} rounded`}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase quantity of ${item.name}`} className={`px-2 py-0.5 border ${isDark ? 'border-white/20' : 'border-black/20'} rounded`}>+</button>
                    </div>
                )}
                <p className="font-semibold w-16 text-right text-text">₹{item.price * item.quantity}</p>
                <button onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name} from cart`} className="text-text/60 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
            </div>
        )
    };
    
    const modalClasses = `${isDark ? 'bg-slate-800/60' : 'bg-white/70'} backdrop-blur-xl shadow-xl border ${isDark ? 'border-white/10' : 'border-white/40'}`;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div role="dialog" aria-modal="true" aria-labelledby="cart-modal-title" className={`rounded-2xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-slide-up ${modalClasses}`} onClick={e => e.stopPropagation()}>
                <div className={`flex justify-between items-center p-6 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                    <h2 id="cart-modal-title" className="text-2xl font-bold text-text font-serif">Your Cart</h2>
                    <button onClick={onClose} aria-label="Close cart" className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-text"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {cart.length > 0 ? (
                        <div className="space-y-6">
                            {Object.keys(groupedCart).map((providerId) => {
                                const { providerName, items } = groupedCart[providerId];
                                const itemsByWindow = items.reduce((acc, item) => {
                                    const windowKey = item.deliveryWindow || 'Now';
                                    if (!acc[windowKey]) {
                                        acc[windowKey] = [];
                                    }
                                    acc[windowKey].push(item);
                                    return acc;
                                }, {} as Record<string, CartItem[]>);
                                
                                return (
                                <div key={providerId}>
                                    <h3 className={`font-bold text-lg p-2 rounded-md text-text/90 ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'}`}>From: {providerName}</h3>
                                    {Object.keys(itemsByWindow).map(windowKey => (
                                        <div key={windowKey} className="mt-2">
                                            <p className="text-sm font-semibold text-brand-primary pl-1 pb-1">For: {windowKey}</p>
                                            {itemsByWindow[windowKey].map(item => <CartLineItem key={item.id} item={item}/>)}
                                        </div>
                                    ))}
                                </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-text/70"><span className="text-6xl mb-4 block" role="img" aria-label="empty cart">🛒</span><h3 className="text-xl font-semibold text-text">Your cart is empty</h3><p className="mt-2">Looks like you haven't added any meals yet.</p></div>
                    )}
                </div>
                {cart.length > 0 && (
                    <div className={`p-6 mt-auto border-t ${isDark ? 'border-white/10 bg-slate-900/50' : 'border-black/10 bg-white/50'} rounded-b-2xl`}>
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center"><span className="text-lg text-text/80">Subtotal ({cartCount} items):</span><span className="text-lg text-text">₹{totalPrice.toFixed(2)}</span></div>
                            {totalDiscount > 0 && <div className={`flex justify-between items-center ${isDark ? 'text-green-400' : 'text-green-600'}`}><span className="text-lg font-semibold">Volume Discount:</span><span className="text-lg font-semibold">- ₹{totalDiscount.toFixed(2)}</span></div>}
                             <div className={`flex justify-between items-center text-xl font-bold pt-2 border-t ${isDark ? 'border-white/10' : 'border-black/10'} mt-2`}><span className="text-text">Total:</span><span className="text-text">₹{finalTotalPrice.toFixed(2)}</span></div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <button onClick={clearCart} className="text-sm text-text/60 hover:text-red-500 hover:underline">Clear Cart</button>
                            <button onClick={handleCheckout} className="w-full sm:w-auto bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity duration-300 animate-press">Proceed to Checkout</button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        modalRoot
    );
};

export default CartModal;
