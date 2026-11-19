import React, { createContext, useState, useMemo, useEffect } from 'react';
import type { CartItem, Meal, TiffinPlan } from '../types';
import * as analyticsService from '../services/analyticsService';
import { VegIcon, NonVegIcon, XMarkIcon, TrashIcon, BookmarkSquareIcon } from '../constants';

interface GroupedCart {
  [providerId: string]: {
    providerName: string;
    items: CartItem[];
  }
}

interface CartContextType {
  cart: CartItem[];
  groupedCart: GroupedCart;
  addToCart: (item: Meal | TiffinPlan, providerId: string, providerName: string, deliveryWindow?: string) => void;
  removeFromCart: (mealId: string) => void;
  updateQuantity: (mealId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const storedCartData = localStorage.getItem('homeplatter-cart');
      if (storedCartData) {
        const parsedData = JSON.parse(storedCartData);
        if (Array.isArray(parsedData)) {
          return parsedData;
        }
        return parsedData.items || [];
      }
      return [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      const cartData = {
        items: cart,
        lastUpdated: new Date().toISOString(),
        reminderSent: false 
      };
      localStorage.setItem('homeplatter-cart', JSON.stringify(cartData));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cart]);

  const addToCart = (item: Meal | TiffinPlan, providerId: string, providerName: string, deliveryWindow?: string) => {
    const itemType = 'duration' in item ? 'PLAN' : 'MEAL';
    
    setCart(prevCart => {
      if (itemType === 'MEAL') {
        const meal = item as Meal;
        // For meals, the combination of meal ID and delivery window makes an item unique
        const existingItem = prevCart.find(cartItem => cartItem.id === meal.id && cartItem.itemType === 'MEAL' && cartItem.deliveryWindow === deliveryWindow);
        
        const finalPrice = meal.discountPercentage 
          ? meal.price * (1 - meal.discountPercentage / 100) 
          : meal.price;

        if (existingItem) {
          return prevCart.map(i =>
            i.id === meal.id && i.deliveryWindow === deliveryWindow ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        
        const newCartItem: CartItem = {
            id: meal.id, name: meal.name, price: finalPrice, quantity: 1, providerId, providerName, itemType: 'MEAL',
            description: meal.description, type: meal.type, imageUrl: meal.imageUrl, discountPercentage: meal.discountPercentage,
            deliveryWindow,
        };
        return [...prevCart, newCartItem];
      }
      
      if (itemType === 'PLAN') {
        const plan = item as TiffinPlan;
        const existingPlan = prevCart.find(cartItem => cartItem.id === plan.id && cartItem.itemType === 'PLAN');
        
        if (existingPlan) {
          alert("This plan is already in your cart.");
          return prevCart;
        }
        
        const newCartItem: CartItem = {
            id: plan.id, name: plan.name, price: plan.price, quantity: 1, providerId, providerName, itemType: 'PLAN',
            description: plan.description, duration: plan.duration,
            // Plans don't have a delivery window in the same way, can be added later if needed
        };
        return [...prevCart, newCartItem];
      }
      
      return prevCart;
    });
    
    analyticsService.trackEvent('add_to_cart', { 
      itemId: item.id, itemName: item.name, price: item.price, itemType: itemType, providerId: providerId 
    });
  };

  const removeFromCart = (itemId: string) => {
    const itemToRemove = cart.find(item => item.id === itemId);
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    if (itemToRemove) {
      analyticsService.trackEvent('remove_from_cart', {
        mealId: itemToRemove.id,
        mealName: itemToRemove.name,
      });
    }
  };
  
  const updateQuantity = (itemId: string, quantity: number) => {
    setCart(prevCart => {
      const itemToUpdate = prevCart.find(item => item.id === itemId);
      
      if (!itemToUpdate || itemToUpdate.itemType === 'PLAN') {
        return prevCart; // Do not allow quantity changes for plans
      }

      if (quantity <= 0) {
        return prevCart.filter(item => item.id !== itemId);
      }
      return prevCart.map(item => item.id === itemId ? {...item, quantity} : item);
    });
  };
  
  const clearCart = () => {
    setCart([]);
  }

  const cartCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);
  
  const totalPrice = useMemo(() => {
      return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);
  
  const groupedCart = useMemo(() => {
    const acc: GroupedCart = {};
    for (const item of cart) {
      if (!acc[item.providerId]) {
        acc[item.providerId] = {
          providerName: item.providerName,
          items: [],
        };
      }
      acc[item.providerId].items.push(item);
    }
    return acc;
  }, [cart]);


  return (
    <CartContext.Provider value={{ cart, groupedCart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};