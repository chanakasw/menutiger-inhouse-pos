import { useState } from 'react';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Category } from '@swiftpos/types';
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from './useProductManagement';

interface CategoryManagerProps {
  categories: Category[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    await createCategory.mutateAsync({ name, sortOrder: categories.length });
    setNewName('');
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleUpdate = async (id: string) => {
    const name = editName.trim();
    if (!name) return;
    await updateCategory.mutateAsync({ id, data: { name } });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory.mutateAsync(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) =>
          editingId === cat.id ? (
            <div key={cat.id} className="flex items-center gap-1">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleUpdate(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                className="h-7 w-32 text-xs"
                autoFocus
              />
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleUpdate(cat.id)} disabled={updateCategory.isPending}>
                <Check className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : confirmDeleteId === cat.id ? (
            <div key={cat.id} className="flex items-center gap-1 rounded-full border border-destructive px-2 py-0.5">
              <span className="text-xs text-destructive">Delete "{cat.name}"?</span>
              <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive hover:text-destructive" onClick={() => handleDelete(cat.id)} disabled={deleteCategory.isPending}>
                <Check className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setConfirmDeleteId(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Badge key={cat.id} variant="secondary" className="gap-1 pr-1">
              {cat.name}
              <button onClick={() => startEdit(cat)} className="ml-1 rounded hover:text-foreground text-muted-foreground">
                <Pencil className="h-3 w-3" />
              </button>
              <button onClick={() => setConfirmDeleteId(cat.id)} className="rounded hover:text-destructive text-muted-foreground">
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          )
        )}
      </div>

      {/* Add new category */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="New category name…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void handleCreate(); }}
          className="h-8 w-48 text-sm"
        />
        <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleCreate} disabled={!newName.trim() || createCategory.isPending}>
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </div>
    </div>
  );
}
