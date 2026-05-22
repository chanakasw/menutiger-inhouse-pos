import { useCartStore } from '../store';

/** Convenience wrapper over the cart Zustand store. Keeps feature components free of store imports. */
export function useCart() {
  const store = useCartStore();
  return {
    items: store.items,
    customerId: store.customerId,
    discount: store.discount,
    subtotal: store.subtotal(),
    itemCount: store.itemCount(),
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    setCustomer: store.setCustomer,
    setDiscount: store.setDiscount,
    clearCart: store.clearCart,
  };
}
