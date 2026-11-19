import React, { useState, useEffect, useCallback } from 'react';
import type { MealProvider, Coupon } from '../types';
import * as providerApi from '../api/providerApi';
import { useAuth } from '../hooks/useAuth';
import { TagIcon, PlusIcon } from '../constants';
import CouponFormModal from './CouponFormModal';
import Loader from './Loader';

interface CouponManagerProps {
    provider: MealProvider | null;
}

const CouponManager: React.FC<CouponManagerProps> = ({ provider }) => {
    const { token } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCoupons = useCallback(async () => {
        if (!provider?.id || !token) return;
        setIsLoading(true);
        try {
            const data = await providerApi.getCoupons(provider.id, token);
            setCoupons(data);
        } catch (error) {
            console.error("Failed to fetch coupons", error);
        } finally {
            setIsLoading(false);
        }
    }, [provider?.id, token]);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const handleCreateCoupon = async (couponData: Omit<Coupon, 'id' | 'providerId' | 'isActive'>) => {
        if (!provider?.id || !token) {
            throw new Error("Cannot create coupon: provider or auth token is missing.");
        }
        await providerApi.createCoupon(provider.id, couponData, token);
        await fetchCoupons();
    };
    
    const now = new Date();
    const activeCoupons = coupons.filter(c => new Date(c.expiresAt) > now);
    const expiredCoupons = coupons.filter(c => new Date(c.expiresAt) <= now);

    return (
        <>
            <div className="p-6 flex flex-col items-center h-full">
                <TagIcon className="w-16 h-16 text-yellow-600 mb-4" />
                <h2 className="text-2xl font-bold text-text">Manage Coupons</h2>
                <div className="text-sm text-text/70 mt-2 flex-grow text-center">
                    {isLoading ? <Loader text="" /> : 
                        activeCoupons.length > 0 ? (
                            <p>{activeCoupons.length} active coupon{activeCoupons.length > 1 ? 's' : ''}.</p>
                        ) : (
                            <p>Create promotional codes to attract customers.</p>
                        )
                    }
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-700 transition-colors duration-300"
                >
                    <PlusIcon className="w-5 h-5"/>
                    New Coupon
                </button>
            </div>
            <CouponFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateCoupon}
            />
        </>
    );
};

export default CouponManager;