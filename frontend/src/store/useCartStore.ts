import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useSyncExternalStore } from 'react';
import { Product } from '@/lib/api';

export interface CartItem {
  productId: number;
  name: string;
  slug?: string;
  price: number;
  quantity: number;
  image: string | null;
  weight: number;
  stock: number;
}

export interface AddItemInput {
  productId?: number;
  id?: number;
  name: string;
  slug?: string;
  price: number | string;
  quantity?: number;
  image: string | null;
  weight: number;
  stock?: number;
}

export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: AddItemInput | Product | CartItem, quantity?: number) => boolean;
  removeItem: (productId: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
  getTotalWeight: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product: AddItemInput | Product | CartItem, quantity = 1) => {
        const productId = ('id' in product && typeof product.id === 'number')
          ? product.id
          : ('productId' in product && typeof product.productId === 'number')
            ? product.productId
            : 0;
        const name = product.name;
        const slug = 'slug' in product ? product.slug : undefined;
        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        const image = product.image;
        const weight = product.weight;
        const stock = product.stock ?? 999;

        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.productId === productId);
        const currentQty = existingItem ? existingItem.quantity : 0;

        if (currentQty + quantity > stock) {
          return false;
        }

        set((state) => {
          const index = state.items.findIndex((item) => item.productId === productId);
          if (index > -1) {
            const updated = [...state.items];
            updated[index] = {
              ...updated[index],
              quantity: updated[index].quantity + quantity,
              stock,
              price,
            };
            return { items: updated };
          }

          return {
            items: [
              ...state.items,
              {
                productId,
                name,
                slug,
                price,
                quantity,
                image,
                weight,
                stock,
              },
            ],
          };
        });

        return true;
      },

      removeItem: (productId: number) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      increaseQuantity: (productId: number) => {
        set((state) => {
          const updatedItems = state.items.map((item) => {
            if (item.productId === productId) {
              const maxStock = item.stock ?? 999;
              const newQuantity = Math.min(item.quantity + 1, maxStock);
              return { ...item, quantity: newQuantity };
            }
            return item;
          });

          return { items: updatedItems };
        });
      },

      decreaseQuantity: (productId: number) => {
        set((state) => {
          const updatedItems = state.items
            .map((item) => {
              if (item.productId === productId) {
                return { ...item, quantity: item.quantity - 1 };
              }
              return item;
            })
            .filter((item) => item.quantity > 0);

          return { items: updatedItems };
        });
      },

      setQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => {
          const updatedItems = state.items.map((item) => {
            if (item.productId === productId) {
              const maxStock = item.stock ?? 999;
              const safeQuantity = Math.min(quantity, maxStock);
              return { ...item, quantity: Math.max(1, safeQuantity) };
            }
            return item;
          });

          return { items: updatedItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalWeight: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.weight * item.quantity, 0);
      },
    }),
    {
      name: 'lumiere-shopping-bag',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

const emptySubscribe = () => () => {};

/**
 * Custom React hook to safely wait for client-side Zustand hydration to complete.
 * Uses useSyncExternalStore to prevent SSR mismatch errors in Next.js without cascading renders.
 */
export function useCartHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
