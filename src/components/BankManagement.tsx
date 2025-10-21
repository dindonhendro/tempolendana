import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Save, X, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/supabase";

type BankProduct = Tables<"bank_products">;
type Bank = Tables<"banks">;

export default function BankManagement() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [products, setProducts] = useState<BankProduct[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBanks();
  }, []);

  useEffect(() => {
    if (selectedBankId) {
      loadProducts(selectedBankId);
    } else {
      setProducts([]);
    }
  }, [selectedBankId]);

  const loadBanks = async () => {
    try {
      const { data, error } = await supabase
        .from("banks")
        .select("*")
        .order("name");

      if (error) throw error;
      setBanks(data || []);
    } catch (error) {
      console.error("Error loading banks:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (bankId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bank_products")
        .select("*")
        .eq("bank_id", bankId)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product: BankProduct) => {
    setEditingProductId(product.id);
    setEditDescription(product.product_description || "");
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditDescription("");
  };

  const handleSaveDescription = async (productId: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("bank_products")
        .update({
          product_description: editDescription.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);

      if (error) throw error;

      alert("Product description updated successfully!");
      setEditingProductId(null);
      setEditDescription("");
      loadProducts(selectedBankId);
    } catch (error) {
      console.error("Error updating product description:", error);
      alert("Failed to update product description. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#5680E9] mb-2">
            Bank Product Management
          </h1>
          <p className="text-gray-600">
            Manage bank products and their descriptions
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Bank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Label htmlFor="bank-select">Choose a bank to manage products</Label>
              <Select value={selectedBankId} onValueChange={setSelectedBankId}>
                <SelectTrigger id="bank-select" className="mt-2">
                  <SelectValue placeholder="Select a bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name} ({bank.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedBankId && (
          <Card>
            <CardHeader>
              <CardTitle>
                Bank Products ({products.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p>Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    No products found for this bank
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Interest Rate</TableHead>
                        <TableHead>Amount Range</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                              {product.type}
                            </span>
                          </TableCell>
                          <TableCell>{product.interest_rate}%</TableCell>
                          <TableCell className="text-sm">
                            Rp {product.min_amount.toLocaleString()} - Rp{" "}
                            {product.max_amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {editingProductId === product.id ? (
                              <Textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Enter product description..."
                                rows={4}
                                className="min-w-[300px]"
                              />
                            ) : (
                              <div className="max-w-md">
                                {product.product_description ? (
                                  <p className="text-sm text-gray-700 line-clamp-3">
                                    {product.product_description}
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-400 italic">
                                    No description
                                  </p>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingProductId === product.id ? (
                              <div className="flex justify-end space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveDescription(product.id)}
                                  disabled={saving}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="h-4 w-4 mr-1" />
                                  {saving ? "Saving..." : "Save"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  disabled={saving}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditClick(product)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
