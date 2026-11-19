import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import * as orderApi from '../api/orderApi';
import * as userApi from '../api/userApi';
import * as providerApi from '../api/providerApi';
import * as inquiryApi from '../api/inquiryApi'; // New Import
import * as analyticsService from '../services/analyticsService';
import type { Address, Coupon, MealProvider, OrderAddOn, Inquiry } from '../types';
import { CreditCardIcon, TagIcon, HomePlatterLogoIcon, GiftIcon, TruckIcon, LOYALTY_POINT_VALUE } from '../constants';
import PaymentModal from './PaymentModal';
import Loader from './Loader';

interface CheckoutPageProps {
    navigate: (path: string, params?: Record<string, any>) => void;
    routeParams?: Record<string, any> | null;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate, routeParams }) => {
    const { cart, groupedCart, totalPrice, clearCart } = useCart();
    const { user, token } = useAuth();
    
    // New state for catering checkout mode
    const [isCateringCheckout, setIsCateringCheckout] = useState(false);
    const [cateringInquiry, setCateringInquiry] = useState<Inquiry | null>(null);
    const [isCateringLoading, setIsCateringLoading] = useState(false);
    
    const [name, setName] = useState(user?.name || '');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [phone, setPhone] = useState('');

    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    const [payment, setPayment] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const [providers, setProviders] = useState<MealProvider[]>([]);
    
    const [availableAddOns, setAvailableAddOns] = useState<OrderAddOn[]>([]);
    const [selectedAddOnIds, setSelectedAddOnIds] = useState<Set<string>>(new Set());

    const [couponCodes, setCouponCodes] = useState<Record<string, string>>({});
    const [appliedCoupons, setAppliedCoupons] = useState<Record<string, Coupon | null>>({});
    const [couponErrors, setCouponErrors] = useState<Record<string, string>>({});
    const [validatingCoupons, setValidatingCoupons] = useState<Set<string>>(new Set());
    
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [redeemPoints, setRedeemPoints] = useState(false);
    
    const [deliveryMethods, setDeliveryMethods] = useState<Record<string, 'PICKUP' | 'DELIVERY'>>({});

    useEffect(() => {
        analyticsService.trackEvent('begin_checkout', { 
          item_count: cart.length,
          total_value: totalPrice 
        });

        const inquiryId = routeParams?.inquiryId;
        if (inquiryId && token) {
            setIsCateringCheckout(true);
            setIsCateringLoading(true);
            inquiryApi.getInquiryById(inquiryId, token)
                .then(setCateringInquiry)
                .catch(err => setError(err.message || "Failed to load catering inquiry."))
                .finally(() => setIsCateringLoading(false));
        }

        if (user && token) {
            userApi.getUserProfile(user.id, token)
                .then(fullUser => {
                    setSavedAddresses(fullUser.addresses || []);
                    setLoyaltyPoints(fullUser.loyaltyPoints || 0);
                })
                .catch(console.error);
        }
        providerApi.getProviders().then(setProviders).catch(console.error);
        orderApi.getAvailableAddOns().then(setAvailableAddOns).catch(console.error);
    }, [user, token, routeParams, cart.length, totalPrice]);

    useEffect(() => {
        const initialMethods: Record<string, 'PICKUP' | 'DELIVERY'> = {};
        Object.keys(groupedCart).forEach(providerId => {
            initialMethods[providerId] = 'PICKUP';
        });
        setDeliveryMethods(initialMethods);
    }, [groupedCart]);
    
    const handleSelectAddress = (address: Address) => {
        setSelectedAddressId(address.id);
        setName(user?.name || '');
        setStreet(address.street);
        setCity(address.city);
        setPostalCode(address.postalCode);
        setPhone(address.phone);
    };

    const handleUseNewAddress = () => {
        setSelectedAddressId(null);
        setName(user?.name || '');
        setStreet('');
        setCity('');
        setPostalCode('');
        setPhone('');
    };

    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPayment(prev => ({...prev, [name]: value}));
    }
    
    const handleApplyCoupon = async (providerId: string) => {
        const code = couponCodes[providerId];
        if (!code || !token) return;

        setValidatingCoupons(prev => new Set(prev).add(providerId));
        setCouponErrors(prev => ({ ...prev, [providerId]: '' }));

        try {
            const result = await orderApi.validateCoupon(providerId, code, token);
            if (result.isValid && result.coupon) {
                setAppliedCoupons(prev => ({...prev, [providerId]: result.coupon }));
            } else {
                setAppliedCoupons(prev => ({...prev, [providerId]: null }));
                setCouponErrors(prev => ({...prev, [providerId]: result.message }));
            }
        } catch (err: any) {
            setCouponErrors(prev => ({...prev, [providerId]: err.message }));
        } finally {
            setValidatingCoupons(prev => {
                const newSet = new Set(prev);
                newSet.delete(providerId);
                return newSet;
            });
        }
    };

    const handleAddOnToggle = (addOnId: string) => {
        setSelectedAddOnIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(addOnId)) {
                newSet.delete(addOnId);
            } else {
                newSet.add(addOnId);
            }
            return newSet;
        });
    };

    const isFormValid = name && street && city && postalCode && phone && payment.cardNumber && payment.cardName && payment.expiryDate && payment.cvv;

    const cateringQuoteAmount = useMemo(() => {
        if (!isCateringCheckout || !cateringInquiry) return 0;
        const quoteMessage = cateringInquiry.messages.find(m => m.messageType === 'quote');
        return quoteMessage?.quote?.amount || 0;
    }, [isCateringCheckout, cateringInquiry]);

    const { finalTotalPrice, totalCouponDiscount, totalVolumeDiscount, addOnsTotal, loyaltyDiscount, totalDeliveryFee } = useMemo(() => {
        if (isCateringCheckout) {
            return { finalTotalPrice: cateringQuoteAmount, totalCouponDiscount: 0, totalVolumeDiscount: 0, addOnsTotal: 0, loyaltyDiscount: 0, totalDeliveryFee: 0 };
        }
        
        let subTotalAfterDiscounts = 0;
        let couponDiscount = 0;
        let volumeDiscount = 0;
        let deliveryFee = 0;

        const calculatedAddOnsTotal = availableAddOns
            .filter(addon => selectedAddOnIds.has(addon.id))
            .reduce((sum, addon) => sum + addon.price, 0);

        if (!providers.length) {
             const totalWithAddons = totalPrice + calculatedAddOnsTotal;
             const loyaltyDisc = redeemPoints ? Math.min(totalWithAddons, (loyaltyPoints || 0) * LOYALTY_POINT_VALUE) : 0;
             return { finalTotalPrice: totalWithAddons - loyaltyDisc, totalCouponDiscount: 0, totalVolumeDiscount: 0, addOnsTotal: calculatedAddOnsTotal, loyaltyDiscount: loyaltyDisc, totalDeliveryFee: 0 };
        }

        for (const providerId of Object.keys(groupedCart)) {
            const { items } = groupedCart[providerId];
            const providerSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            let providerSubtotalAfterDiscounts = providerSubtotal;

            // Apply volume discount first
            const provider = providers.find(p => p.id === providerId);
            const thresholdDiscount = provider?.orderThresholdDiscount;
            if (thresholdDiscount && providerSubtotal >= thresholdDiscount.threshold) {
                const discountAmount = providerSubtotal * (thresholdDiscount.percentage / 100);
                volumeDiscount += discountAmount;
                providerSubtotalAfterDiscounts -= discountAmount;
            }

            // Then apply coupon on the discounted price
            const appliedCoupon = appliedCoupons[providerId];
            if (appliedCoupon) {
                const discountAmount = providerSubtotalAfterDiscounts * (appliedCoupon.discountPercentage / 100);
                couponDiscount += discountAmount;
                providerSubtotalAfterDiscounts -= discountAmount;
            }

            // Add delivery fee
            const deliveryMethod = deliveryMethods[providerId] || 'PICKUP';
            if (deliveryMethod === 'DELIVERY' && provider?.deliveryFee) {
                deliveryFee += provider.deliveryFee;
            }

            subTotalAfterDiscounts += providerSubtotalAfterDiscounts;
        }

        let totalBeforeLoyalty = subTotalAfterDiscounts + calculatedAddOnsTotal + deliveryFee;

        let calculatedLoyaltyDiscount = 0;
        if (redeemPoints) {
            const availableDiscount = (loyaltyPoints || 0) * LOYALTY_POINT_VALUE;
            calculatedLoyaltyDiscount = Math.min(totalBeforeLoyalty, availableDiscount);
        }

        const finalTotal = totalBeforeLoyalty - calculatedLoyaltyDiscount;

        return {
            finalTotalPrice: Math.max(0, finalTotal),
            totalCouponDiscount: couponDiscount,
            totalVolumeDiscount: volumeDiscount,
            addOnsTotal: calculatedAddOnsTotal,
            loyaltyDiscount: calculatedLoyaltyDiscount,
            totalDeliveryFee: deliveryFee,
        };
    }, [isCateringCheckout, cateringQuoteAmount, groupedCart, providers, totalPrice, appliedCoupons, selectedAddOnIds, availableAddOns, redeemPoints, loyaltyPoints, deliveryMethods]);

    const handleSubmit = async () => {
        if (isSubmitting) return;

        if (isCateringCheckout) {
            if (!payment.cardNumber || !payment.cardName || !payment.expiryDate || !payment.cvv) {
                setError("Please fill in all payment details.");
                return;
            }
        } else {
            if (!isFormValid) {
                setError("Please fill in all required address and payment fields.");
                return;
            }
        }
        setError('');
        setIsPaymentModalOpen(true);
    };

    const handleConfirmPayment = async () => {
        setError('');
        setIsSubmitting(true);
        try {
            if (!user || !token) {
                throw new Error("You must be logged in to place an order.");
            }

            if (isCateringCheckout) {
                if (!cateringInquiry) throw new Error("Catering inquiry not found.");
                await orderApi.checkoutCatering(cateringInquiry, token);
            } else {
                 if (cart.length === 0) {
                    throw new Error("Your cart is empty.");
                }
                const selectedAddOns = availableAddOns.filter(a => selectedAddOnIds.has(a.id));
                await orderApi.checkout(user, cart, token, selectedAddOns, deliveryMethods, redeemPoints, appliedCoupons);
                clearCart();
            }

            analyticsService.trackEvent('complete_order', {
              total: finalTotalPrice,
              item_count: cart.length,
              is_catering: isCateringCheckout,
            });

            navigate('/order-success');

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setIsPaymentModalOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCateringLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader text="Loading your catering order..." /></div>
    }

    return (
        <>
            <div className="bg-gray-50 min-h-screen">
                <header className="bg-white shadow-sm sticky top-0 z-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <button onClick={() => navigate('/')} className="cursor-pointer flex items-center space-x-2">
                            <HomePlatterLogoIcon className="w-12 h-12" />
                            <h1 className="text-2xl font-bold text-gray-800 font-serif">Checkout</h1>
                        </button>
                    </div>
                </header>
                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg space-y-8">
                            {!isCateringCheckout && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 font-serif mb-4">Shipping Address</h2>
                                    {savedAddresses.length > 0 && (
                                        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {savedAddresses.map(addr => (
                                                <button key={addr.id} onClick={() => handleSelectAddress(addr)} className={`p-4 rounded-lg border-2 text-left transition ${selectedAddressId === addr.id ? 'border-brand-primary bg-brand-light' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                                    <p className="font-bold">{addr.name}</p>
                                                    <p className="text-sm text-gray-600">{addr.street}, {addr.city}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <button onClick={handleUseNewAddress} className={`w-full p-4 rounded-lg border-2 text-left font-bold transition ${!selectedAddressId ? 'border-brand-primary bg-brand-light' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                        Use a new address
                                    </button>
                                    {!selectedAddressId && (
                                        <div className="mt-4 space-y-4 animate-fade-in">
                                            {/* Form fields */}
                                            <input name="name" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full p-3 border rounded-lg" />
                                            <input name="street" value={street} onChange={e => setStreet(e.target.value)} placeholder="Street Address" className="w-full p-3 border rounded-lg" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input name="city" value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="w-full p-3 border rounded-lg" />
                                                <input name="postalCode" value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="Postal Code" className="w-full p-3 border rounded-lg" />
                                            </div>
                                            <input name="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" className="w-full p-3 border rounded-lg" />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 font-serif mb-4 flex items-center gap-2"><CreditCardIcon className="w-6 h-6"/> Payment Details</h2>
                                <div className="space-y-4">
                                    <input name="cardNumber" value={payment.cardNumber} onChange={handlePaymentChange} placeholder="Card Number" className="w-full p-3 border rounded-lg" />
                                    <input name="cardName" value={payment.cardName} onChange={handlePaymentChange} placeholder="Name on Card" className="w-full p-3 border rounded-lg" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input name="expiryDate" value={payment.expiryDate} onChange={handlePaymentChange} placeholder="MM/YY" className="w-full p-3 border rounded-lg" />
                                        <input name="cvv" value={payment.cvv} onChange={handlePaymentChange} placeholder="CVV" className="w-full p-3 border rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg sticky top-24 space-y-4">
                           <h2 className="text-2xl font-bold text-gray-800 font-serif mb-4">Order Summary</h2>
                           
                           {isCateringCheckout && cateringInquiry ? (
                               <div>
                                   <p className="font-semibold">{cateringInquiry.customerName}'s Catering Order</p>
                                   <p className="text-sm text-gray-600">for {providers.find(p => p.id === cateringInquiry.providerId)?.name}</p>
                               </div>
                           ) : (
                               Object.keys(groupedCart).map(providerId => {
                                   const { providerName, items } = groupedCart[providerId];
                                   const providerSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                                   return (
                                       <div key={providerId} className="border-b pb-4">
                                           <h3 className="font-bold">{providerName}</h3>
                                           {items.map(item => (
                                               <div key={item.id} className="flex justify-between text-sm py-1">
                                                   <span>{item.name} x{item.quantity}</span>
                                                   <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                               </div>
                                           ))}
                                           {/* Delivery Method */}
                                           <div className="mt-2 text-sm">
                                               <span className="font-semibold">Delivery Method:</span>
                                               <div className="flex gap-2 mt-1">
                                                   <button onClick={() => setDeliveryMethods(p => ({...p, [providerId]: 'PICKUP'}))} className={`p-2 rounded-md text-xs border ${deliveryMethods[providerId] === 'PICKUP' ? 'bg-blue-100 border-blue-300' : ''}`}>Pickup</button>
                                                   <button onClick={() => setDeliveryMethods(p => ({...p, [providerId]: 'DELIVERY'}))} disabled={!providers.find(p => p.id === providerId)?.deliveryFee} className={`p-2 rounded-md text-xs border ${deliveryMethods[providerId] === 'DELIVERY' ? 'bg-blue-100 border-blue-300' : ''} disabled:opacity-50`}>Delivery (+₹{providers.find(p => p.id === providerId)?.deliveryFee || 'N/A'})</button>
                                               </div>
                                           </div>
                                            {/* Coupon */}
                                           <div className="flex gap-2 mt-2">
                                               <input value={couponCodes[providerId] || ''} onChange={e => setCouponCodes(p => ({...p, [providerId]: e.target.value}))} placeholder="Coupon Code" className="w-full p-2 border rounded-lg text-sm" />
                                               <button onClick={() => handleApplyCoupon(providerId)} disabled={validatingCoupons.has(providerId)} className="bg-gray-200 px-3 rounded-lg text-sm font-semibold hover:bg-gray-300 disabled:opacity-50">{validatingCoupons.has(providerId) ? '...' : 'Apply'}</button>
                                           </div>
                                           {couponErrors[providerId] && <p className="text-red-500 text-xs mt-1">{couponErrors[providerId]}</p>}
                                           {appliedCoupons[providerId] && <p className="text-green-600 text-xs mt-1 font-semibold">Applied: {appliedCoupons[providerId]?.discountPercentage}% off!</p>}
                                       </div>
                                   );
                               })
                           )}
                           
                           {!isCateringCheckout && (
                                <div className="border-b pb-4">
                                    <h3 className="font-bold mb-2">Optional Add-ons</h3>
                                    {availableAddOns.map(addon => (
                                        <label key={addon.id} className="flex items-center gap-2 text-sm py-1">
                                            <input type="checkbox" checked={selectedAddOnIds.has(addon.id)} onChange={() => handleAddOnToggle(addon.id)} className="h-4 w-4 rounded" />
                                            <span>{addon.name} (+₹{addon.price.toFixed(2)})</span>
                                        </label>
                                    ))}
                                </div>
                           )}

                           {loyaltyPoints > 0 && !isCateringCheckout && (
                               <div className="border-b pb-4">
                                   <label className="flex items-center gap-2 font-semibold text-yellow-800">
                                       <input type="checkbox" checked={redeemPoints} onChange={e => setRedeemPoints(e.target.checked)} className="h-4 w-4 rounded" />
                                       <span>Redeem {loyaltyPoints} Loyalty Points (≈ ₹{(loyaltyPoints * LOYALTY_POINT_VALUE).toFixed(2)})</span>
                                   </label>
                               </div>
                           )}

                           <div className="space-y-1 text-sm">
                                <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span> <span>₹{isCateringCheckout ? cateringQuoteAmount.toFixed(2) : totalPrice.toFixed(2)}</span></div>
                                {addOnsTotal > 0 && <div className="flex justify-between"><span className="text-gray-600">Add-ons:</span> <span>₹{addOnsTotal.toFixed(2)}</span></div>}
                                {totalDeliveryFee > 0 && <div className="flex justify-between"><span className="text-gray-600">Delivery Fee:</span> <span>₹{totalDeliveryFee.toFixed(2)}</span></div>}
                                {totalVolumeDiscount > 0 && <div className="flex justify-between text-green-600 font-semibold"><span>Volume Discount:</span> <span>- ₹{totalVolumeDiscount.toFixed(2)}</span></div>}
                                {totalCouponDiscount > 0 && <div className="flex justify-between text-green-600 font-semibold"><span>Coupon Discount:</span> <span>- ₹{totalCouponDiscount.toFixed(2)}</span></div>}
                                {loyaltyDiscount > 0 && <div className="flex justify-between text-green-600 font-semibold"><span>Loyalty Points Redeemed:</span> <span>- ₹{loyaltyDiscount.toFixed(2)}</span></div>}
                                <div className="flex justify-between font-bold text-xl pt-2 border-t mt-2"><span>Total:</span> <span>₹{finalTotalPrice.toFixed(2)}</span></div>
                           </div>

                           {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                           
                           <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-dark transition-colors duration-300 disabled:bg-gray-400">
                                {isSubmitting ? 'Processing...' : 'Place Order'}
                           </button>
                        </div>
                    </div>
                </main>
            </div>
            {isPaymentModalOpen && (
                <PaymentModal 
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onConfirmPayment={handleConfirmPayment}
                    totalAmount={finalTotalPrice}
                />
            )}
        </>
    );
};
export default CheckoutPage;