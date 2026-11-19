
import React from 'react';

interface OrderSuccessPageProps {
    navigate: (path: string) => void;
}

const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ navigate }) => {

    const handleContinueShopping = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-xl shadow-2xl p-10 text-center">
                <div className="mb-6">
                    <svg className="w-24 h-24 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h1 className="text-4xl font-bold text-brand-dark mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Order Placed Successfully!
                </h1>
                <p className="text-gray-600 mb-8">
                    Thank you for your order. You can track the status of your order in your profile. We hope you enjoy your delicious homemade meal!
                </p>
                <button 
                    onClick={handleContinueShopping}
                    className="inline-block bg-brand-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300"
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
