import { create } from 'zustand';
import type { Product, PriceVariant } from '@swiftpos/types';

export interface CartItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  customerId: string | undefined;
  discount: number;
  addItem: (product: Product, variant?: PriceVariant) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  setCustomer: (customerId: string | undefined) => void;
  setDiscount: (amount: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  customerId: undefined,
  discount: 0,

  addItem(product, variant) {
    set((state) => {
      const existing = state.items.find(
        (i) => i.productId === product.id && i.variantId === variant?.id
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === product.id && i.variantId === variant?.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            productName: product.name,
            variantId: variant?.id,
            variantName: variant?.name,
            unitPrice: variant?.price ?? product.price,
            quantity: 1,
          },
        ],
      };
    });
  },

  removeItem(productId, variantId) {
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.productId === productId && i.variantId === variantId)
      ),
    }));
  },

  updateQuantity(productId, variantId, quantity) {
    if (quantity <= 0) {
      get().removeItem(productId, variantId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i
      ),
    }));
  },

  setCustomer(customerId) {
    set({ customerId });
  },

  setDiscount(amount) {
    set({ discount: Math.max(0, amount) });
  },

  clearCart() {
    set({ items: [], customerId: undefined, discount: 0 });
  },

  subtotal() {
    return get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  },

  itemCount() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));
