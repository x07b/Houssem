import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Plus, FolderPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category { id: string; name: string; slug: string; published?: boolean; parentId?: string }

export default function CategoriesManager() {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const qc = useQueryClient();

  const { data: list = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const r = await fetch("/api/categories", { cache: "no-store" });
      if (!r.ok) throw new Error("failed");
      return (await r.json()) as Category[];
    },
    staleTime: 60_000,
  });

  const mainCategories = list.filter(c => !c.parentId);
  const getSubcategories = (parentId: string) => list.filter(c => c.parentId === parentId);

  async function add() {
    const body = { name: name.trim(), parentId: parentId || undefined };
    if (!body.name) {
      toast.error("Category name is required");
      return;
    }
    setLoading(true);
    const r = await fetch("/api/categories", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(body) });
    setLoading(false);
    if (!r.ok) { toast.error("Failed to create category"); return; }
    toast.success(parentId ? "Subcategory added" : "Category added");
    setName("");
    setParentId("");
    qc.invalidateQueries({ queryKey: ["categories"] });
  }

  async function update() {
    if (!editingCategory) return;
    const body = { name: name.trim(), parentId: parentId || undefined };
    if (!body.name) {
      toast.error("Category name is required");
      return;
    }
    setLoading(true);
    const r = await fetch(`/api/categories/${editingCategory.id}`, { 
      method: "PUT", 
      headers: { "Content-Type":"application/json" }, 
      body: JSON.stringify(body) 
    });
    setLoading(false);
    if (!r.ok) { toast.error("Failed to update category"); return; }
    toast.success("Category updated");
    setName("");
    setParentId("");
    setEditingCategory(null);
    setDialogOpen(false);
    qc.invalidateQueries({ queryKey: ["categories"] });
  }

  async function remove(id: string) {
    const subcats = list.filter(c => c.parentId === id);
    if (subcats.length > 0) {
      toast.error("Cannot delete category with subcategories. Delete subcategories first.");
      return;
    }
    
    const r = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!r.ok) { toast.error("Cannot delete category in use"); return; }
    toast.success("Category deleted");
    qc.invalidateQueries({ queryKey: ["categories"] });
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    setName(category.name);
    setParentId(category.parentId || "");
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
          <CardDescription>Create and manage product categories and subcategories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input 
                id="categoryName"
                className="w-full" 
                placeholder="Enter category name" 
                value={name} 
                onChange={(e)=>setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && add()}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parentCategory">Parent Category (Optional)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger id="parentCategory">
                  <SelectValue placeholder="None (Main Category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Main Category)</SelectItem>
                  {mainCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select a parent to create a subcategory
              </p>
            </div>

            <Button onClick={add} disabled={loading} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {loading ? "Adding..." : parentId ? "Add Subcategory" : "Add Category"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories & Subcategories</CardTitle>
          <CardDescription>{list.length} total categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mainCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No categories yet. Create one above.</p>
            ) : (
              mainCategories.map(category => {
                const subcategories = getSubcategories(category.id);
                return (
                  <div key={category.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FolderPlus className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{category.name}</span>
                          <span className="text-xs text-muted-foreground">/{category.slug}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => remove(category.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    {subcategories.length > 0 && (
                      <div className="ml-6 space-y-2 border-l-2 pl-4">
                        {subcategories.map(sub => (
                          <div key={sub.id} className="flex items-center justify-between py-2">
                            <div className="flex-1">
                              <span className="text-sm">{sub.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">/{sub.slug}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openEditDialog(sub)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => remove(sub.id)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Category Name</Label>
              <Input 
                id="editName"
                value={name} 
                onChange={(e)=>setName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editParent">Parent Category</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger id="editParent">
                  <SelectValue placeholder="None (Main Category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Main Category)</SelectItem>
                  {mainCategories
                    .filter(c => c.id !== editingCategory?.id)
                    .map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDialogOpen(false);
              setEditingCategory(null);
              setName("");
              setParentId("");
            }}>
              Cancel
            </Button>
            <Button onClick={update} disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
