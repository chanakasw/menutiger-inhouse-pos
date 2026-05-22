import type { PaymentMethod } from '@swiftpos/types';

/** State for the payment modal — collects method and optional amounts. */
export interface PaymentModalState {
  isOpen: boolean;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

/** Data collected from the cashier during payment. */
export interface PaymentFormData {
  method: PaymentMethod;
  amountTendered?: number;
}
