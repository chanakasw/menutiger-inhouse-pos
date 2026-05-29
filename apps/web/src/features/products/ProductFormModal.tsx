import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Product, Category } from '@swiftpos/types';
import { useCreateProduct, useUpdateProduct } from './useProductManagement';

const FormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  price: z.coerce.number({ invalid_type_error: 'Enter a valid price' }).nonnegative('Price must be 0 or more'),
  sku: z.string().max(100).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  imageUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  categoryId: z.string().optional(),
  isAvailable: z.boolean().default(true),
  trackInventory: z.boolean().default(false),
});

type FormValues = z.infer<typeof FormSchema>;

interface ProductFormModalProps {
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
}

export function ProductFormModal({ product, categories, onClose }: ProductFormModalProps) {
  const isEditing = !!product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      price: 0,
      sku: '',
      description: '',
      imageUrl: '',
      categoryId: undefined,
      isAvailable: true,
      trackInventory: false,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        price: product.price,
        sku: product.sku ?? '',
        description: product.description ?? '',
        imageUrl: product.imageUrl ?? '',
        categoryId: product.categoryId ?? undefined,
        isAvailable: product.isAvailable,
        trackInventory: product.trackInventory,
      });
    } else {
      reset({ name: '', price: 0, sku: '', description: '', imageUrl: '', categoryId: undefined, isAvailable: true, trackInventory: false });
    }
  }, [product, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      price: values.price,
      sku: values.sku || undefined,
      description: values.description || undefined,
      imageUrl: values.imageUrl || undefined,
      categoryId: values.categoryId || null,
      isAvailable: values.isAvailable,
      trackInventory: values.trackInventory,
      variants: isEditing ? (product?.variants ?? []) : [],
    };

    if (isEditing) {
      await updateProduct.mutateAsync({ id: product.id, data: payload });
    } else {
      await createProduct.mutateAsync(payload as Parameters<typeof createProduct.mutateAsync>[0]);
    }
    onClose();
  };

  const isAvailable = watch('isAvailable');
  const trackInventory = watch('trackInventory');
  const categoryId = watch('categoryId');

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit product' : 'Add product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register('name')} placeholder="e.g. Espresso" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Price */}
          <div className="space-y-1">
            <Label htmlFor="price">Price *</Label>
            <Input id="price" type="number" step="0.01" min="0" {...register('price')} placeholder="0.00" />
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
          </div>

          {/* SKU */}
          <div className="space-y-1">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...register('sku')} placeholder="e.g. ESP-001" />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={categoryId ?? 'none'} onValueChange={(v) => setValue('categoryId', v === 'none' ? undefined : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} placeholder="Optional description…" rows={2} />
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" {...register('imageUrl')} placeholder="https://…" />
            {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
          </div>

          <Separator />

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Available for sale</p>
                <p className="text-xs text-muted-foreground">Show this product on the checkout grid</p>
              </div>
              <Switch checked={isAvailable} onCheckedChange={(v) => setValue('isAvailable', v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Track inventory</p>
                <p className="text-xs text-muted-foreground">Decrement stock on each sale</p>
              </div>
              <Switch checked={trackInventory} onCheckedChange={(v) => setValue('trackInventory', v)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
