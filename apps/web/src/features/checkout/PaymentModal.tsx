import { useState } from 'react';
import { Banknote, CreditCard, QrCode } from 'lucide-react';
import type { PaymentMethod } from '@swiftpos/types';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ReceiptPreview } from './ReceiptPreview';
import { useCheckout } from './useCheckout';
import type { LocalOrder } from '@/db';
import { formatCurrency } from '@/lib/utils';

interface Totals {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totals: Totals;
}

type ModalStep = 'select' | 'cash-entry' | 'processing' | 'receipt';

const METHODS: { id: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'qr', label: 'QR Pay', icon: QrCode },
];

export function PaymentModal({ isOpen, onClose, totals }: PaymentModalProps) {
  const { completeOrder } = useCheckout();
  const [step, setStep] = useState<ModalStep>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [completedOrder, setCompletedOrder] = useState<LocalOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const change =
    selectedMethod === 'cash'
      ? Math.max(0, parseFloat(amountTendered || '0') - totals.total)
      : 0;

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setAmountTendered(totals.total.toFixed(2));
    if (method === 'cash') setStep('cash-entry');
    else handleConfirm(method);
  };

  const handleConfirm = async (method: PaymentMethod = selectedMethod) => {
    setStep('processing');
    setError(null);
    try {
      const order = await completeOrder(method);
      setCompletedOrder(order);
      setStep('receipt');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setStep('select');
    }
  };

  const handleNewSale = () => {
    setStep('select');
    setSelectedMethod('cash');
    setAmountTendered('');
    setCompletedOrder(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && step !== 'processing') handleNewSale(); }}>
      <DialogContent className="max-w-sm">
        {step === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle>Select payment method</DialogTitle>
              <DialogDescription>Total: {formatCurrency(totals.total)}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-3">
              {METHODS.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant="outline"
                  className="flex h-20 flex-col gap-2"
                  onClick={() => handleSelectMethod(id)}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm">{label}</span>
                </Button>
              ))}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </>
        )}

        {step === 'cash-entry' && (
          <>
            <DialogHeader>
              <DialogTitle>Cash payment</DialogTitle>
              <DialogDescription>Total due: {formatCurrency(totals.total)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="tendered">Amount tendered</Label>
                <Input
                  id="tendered"
                  type="number"
                  min={totals.total}
                  step="0.01"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                  autoFocus
                />
              </div>
              {change > 0 && (
                <div className="rounded-md bg-muted p-3 flex justify-between font-semibold">
                  <span>Change due</span>
                  <span className="text-green-600">{formatCurrency(change)}</span>
                </div>
              )}
              <Separator />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep('select')}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={parseFloat(amountTendered || '0') < totals.total}
                  onClick={() => handleConfirm('cash')}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Processing…</p>
          </div>
        )}

        {step === 'receipt' && completedOrder && (
          <ReceiptPreview order={completedOrder} onNewSale={handleNewSale} />
        )}
      </DialogContent>
    </Dialog>
  );
}
